const express = require('express')
const fs = require('fs')
const NotifyClient = require('notifications-node-client').NotifyClient
const path = require('path');
const axios = require('axios')
const router = express.Router()

const NOTIFY_API_KEY = process.env.NOTIFY_API_KEY || ''
const notifyClient = new NotifyClient(NOTIFY_API_KEY)

router.get('/task-list', function(req,res) {
  let notificationBanner = false

  if (req.session.data['notificationBanner']) {
    notificationBanner = {
      type: req.session.data['notificationBanner']['type'],
      text: req.session.data['notificationBanner']['text']
    }

    req.session.data['notificationBanner'] = false
  }

  return res.render('task-list', { notificationBanner })
})

router.post('/change-delivery-method', function (req, res) {
  const selectedOption = req.body['delivery-method']
  if (!selectedOption) {
    const errorSummary = [
      {
        text: 'Select your delivery method',
        href: '#delivery-method'
      }
    ]
    return res.render('change-delivery-method.html', { errorSummary })
  }
  res.redirect('/check-your-answers')
})

router.post('/type-of-badge', function (req, res) {
  const selectedOption = req.body['type-of-badge']
  if (!selectedOption) {
    const errorSummary = [
      {
        text: 'Select your type of badge',
        href: '#type-of-badge'
      }
    ]
    return res.render('type-of-badge.html', { errorSummary })
  }
  res.redirect('/check-your-answers')
})

router.post('/upload-photo', function (req, res) {
  let errorSummary = []
  let errors = {}

  const uploadedPhoto = req.body['upload-photo']

  if (!uploadedPhoto) {
    const message = 'Please upload a digital photo (PNG, GIF or JPG file) that is no larger than 20MB'
    errorSummary = [
      {
        text: message,
        href: '#upload-photo'
      }
    ]
    errors['upload-photo'] = {
      text: "Please upload a photo"
    }
  }

  if (errorSummary.length > 0 ) {
    return res.render('upload-photo.html', { errorSummary, errors})
  }
  // To test the notification banner, the first time the form is submitted we want to artifically
  // create an error
  else if (!req.session.data['randomError']) {
    req.session.data['randomError'] = true
    req.session.data['upload-photo'] = null
    return res.render('upload-photo.html', { randomError: true })
  } else {
    req.session.data['notificationBanner'] = {
      type: 'success',
      text: 'Your photo has been successfully uploaded'
    }
    res.redirect('/contact-preferences')
  }
})

router.get('/contact-preferences', function(req, res) {
  let notificationBanner = false

  if (req.session.data['notificationBanner']) {
    notificationBanner = {
      type: req.session.data['notificationBanner']['type'],
      text: req.session.data['notificationBanner']['text']
    }
  }

  return res.render('contact-preferences.html', { notificationBanner })
})

router.post('/contact-preferences', function (req, res) {
  let notificationBanner = req.session.data['notificationBanner']

  let errorSummary = []
  let errors = {}

  const selectedOption = req.body['how-contacted']
  if (!selectedOption) {
    const message = 'Select your contact details'
    errorSummary = [
      {
        text: message,
        href: '#how-contacted-conditional'
      }
    ]
    errors['how-contacted'] = {
      text: message
    }
  }

  const contactOption = req.body['contact-by-' + selectedOption]
  if (selectedOption && !contactOption) {
    let textSuffix = ''
    if (selectedOption === 'phone-number') {
      textSuffix = 'phone number'
    } else if (selectedOption === 'email-address') {
      textSuffix = 'email address'
    } else if (selectedOption === 'address') {
      textSuffix = 'post address'
    }

    const message = 'Enter your ' + textSuffix
    errorSummary = [
      {
        text: message,
        href: '#contact-by-' + selectedOption
      }
    ]
    errors['how-contacted'] = true
    errors[selectedOption] = {
      text: message
    }
  }

  if (errorSummary.length > 0) {
    return res.render('contact-preferences.html', { errorSummary, errors, notificationBanner })
  } else {
    req.session.data['notificationBanner'] = {
      type: 'success',
      text: "Your contact details have been saved."
    }
  }

  res.redirect('/task-list')
})

router.get('/backstage', function(req, res) {
    res.render('backstage/index.html');
});


router.post('/backstage/send-invite', function(req, res) {
  if (!NOTIFY_API_KEY) {
    return res.render('backstage/error.html', {
      error: {
        message: 'NOTIFY_API_KEY enviroment key not set.'
      }
    })
  }

  notifyClient.sendEmail(
    '5d54c4a8-ad5e-4612-9be1-f99d0fedbcfe',
    req.session.data['email-address'],
    {
      personalisation: {}
    }
  ).then(response => {
    res.redirect('/backstage/invite-sent');
  }).catch(err => {
    console.error(err.error.errors)
    res.render('backstage/error.html', {
      error: err.error.errors[0]
    });
  })

});


router.get('/backstage/invite-sent', function(req, res) {
  res.render('backstage/invite-sent.html', {
    email: req.session.data['email-address']
  });
});


router.post('/backstage/send-document', function(req, res) {
  if (!NOTIFY_API_KEY) {
    return res.render('backstage/error.html', {
      error: {
        message: 'NOTIFY_API_KEY enviroment key not set.'
      }
    })
  }

  fs.readFile(
    path.resolve(__dirname, '../temp-blue-badge-v2.pdf'),
    function (err, pdfFile) {
      console.log(err)
      notifyClient.sendEmail(
        'a44131f2-474b-4da9-a1fd-7ff7d83d48ad',
        req.session.data['email-address'],
        {
          personalisation: {
            file: notifyClient.prepareUpload(pdfFile)
          }
        }
      ).then(response => {
        res.redirect('/backstage/document-sent');
      }).catch(err => {
        console.error(err.error.errors)
        res.render('backstage/error.html', {
          error: err.error.errors[0]
        });
      })
    }
  );

});


router.get('/backstage/document-sent', function(req, res) {
  res.render('backstage/document-sent.html', {
    email: req.session.data['email-address']
  });
});

//GOV PAY Integration

axios.defaults.baseURL = process.env.API_BASE_URL;
axios.defaults.headers.common["Authorization"] =
  `Bearer ${process.env.CARD_API_TOKEN}`;
axios.defaults.headers.post["Content-Type"] = "application/json";

router.get('/pay/create-payment', function (req, res) {
  const isFastTrack = req.param('fastTrack');
  console.log('PAY - is Fast Track: ', isFastTrack)
  console.log('PAY - process.env.API_BASE_URL: ', process.env.API_BASE_URL)
  console.log('PAY - process.env.LOCAL_URL', process.env.LOCAL_URL)

  axios
    .post("/v1/payments", {
      amount: (isFastTrack ? 1850 : 1000),
      reference: "USER RESEARCH",
      description: (isFastTrack ? "Blue badge application fee (fast track delivery)" : "Blue badge application fee"),
      return_url: `${process.env.LOCAL_URL}/confirmation`
    })
    .then(response => {
      console.log("PAY - response.data.payment_id: ", response.data.payment_id);
      console.log("PAY - redirect link: ", response.data._links.next_url.href);
      res.cookie("paymentId", response.data.payment_id);

      const RETURN_URL = response.data._links.next_url.href.replace(
        process.env.DEFAULT_RETURN_URL,
        process.env.RETURN_URL
      );

      console.log('PAY - return url: ', RETURN_URL)

      res.redirect(RETURN_URL);
    })
    .catch(function (error) {
      console.log(error);
    });
})

module.exports = router
