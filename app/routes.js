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

router.post('/list-healthcare-professionals', function (req, res) {
  let errorSummary = []
  let errors = {}

  const selectedOption = req.body['are-details']
  if (!selectedOption) {
    const message = 'Select yes if you know the details of your healthcare professional'
    errorSummary = [
      {
        text: message,
        href: '#are-details-conditional'
      }
    ]
    errors['are-details'] = {
      text: message
    }
  }

  const professionalName = req.body['healthcare-professional-name']
  const town = req.body['address-town']
  if (selectedOption === "yes" && (!professionalName || !town)) {
    let textSuffix;
    let href;

    if (!professionalName) {
      textSuffix = 'the name of your healthcare professional'
      href = 'healthcare-professional-name'
    }

    else if (!town) {
      textSuffix = 'the town your healthcare professional operates in'
      href = 'address-town'
    }

    const message = 'Enter ' + textSuffix
    errorSummary = [
      {
        text: message,
        href: href
      }
    ]
    errors['use-existing-image'] = true
    errors[selectedOption] = {
      text: message
    }
  }

  if (errorSummary.length > 0) {
    return res.render('list-healthcare-professionals.html', { errorSummary, errors })
  } else {
    if (selectedOption === "yes") {
      req.session.data['notificationBanner'] = {
        type: "success",
        text: "Your healthcare professional's details have been saved."
      }
    }
    res.redirect('/task-list')
  }
})

router.post('/use-existing-image', function (req, res) {
  let errorSummary = []
  let errors = {}

  const selectedOption = req.body['use-existing-image']
  if (!selectedOption) {
    const message = 'Select yes if you would like to use your existing image'
    errorSummary = [
      {
        text: message,
        href: '#use-existing-image-conditional'
      }
    ]
    errors['use-existing-image'] = {
      text: message
    }
  }

  const imageOption = req.body['existing-image-' + selectedOption]
  if (selectedOption === "yes" && !imageOption) {
    let textSuffix = 'existing badge number'
    const message = 'Enter your ' + textSuffix
    errorSummary = [
      {
        text: message,
        href: '#existing-image-' + selectedOption
      }
    ]
    errors['use-existing-image'] = true
    errors[selectedOption] = {
      text: message
    }
  }

  if (errorSummary.length > 0) {
    return res.render('use-existing-image.html', { errorSummary, errors })
  }

  else if (selectedOption === "yes") {
    res.redirect('/task-list')
  } else {
    res.redirect('/upload-photo')
  }
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
  }

  return res.redirect('/task-list')
})

router.post('/contact-preferences', function (req, res) {
  let errorSummary = []
  let errors = {}

  const selectedOption = req.body['how-contacted']

  if (selectedOption == "_unchecked") {
    const message = 'Select at least one contact method'
    errorSummary = [
      {
        text: message,
        href: '#how-contacted-conditional'
      }
    ]
    errors['how-contacted'] = {
      text: message
    }
  } else {
    selectedOption.forEach(function(option) {
      const contactOption = req.body['contact-by-' + option]
      if (!contactOption) {
        let error = {}
        error['href'] = '#contact-by-' + option

        if (option === 'phone-number') {
          error['text'] = 'Enter your phone number'
          errors['phone-number'] = { text: "Enter your phone number" }
        } else if (option === 'email-address') {
          error['text'] = 'Enter your email address'
          errors['email-address'] = { text: "Enter your email address" }
        } else if (option === 'address') {
          error['text'] = 'Enter your post address'
          errors['address'] = { text: "Enter your post address" }
        }

        errorSummary.push(error)
      }
    })
  }

  if (errorSummary.length > 0) {
    return res.render('contact-preferences.html', { errorSummary, errors })
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
    '7995ca7f-293b-4f45-b60b-926a491daec2',
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
        'a878e6b3-968c-4b2b-bd28-352509bbf143',
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

axios.defaults.baseURL = process.env.PAY_API_BASE_URL
axios.defaults.headers.common['Authorization'] =
  `Bearer ${process.env.PAY_API_KEY}`
axios.defaults.headers.post['Content-Type'] = 'application/json'

router.get('/pay/create-payment', function (req, res) {
  const isFastTrack = req.param('fastTrack')
  console.log('PAY - is Fast Track: ', isFastTrack)
  console.log('PAY - process.env.PAY_API_BASE_URL: ', process.env.PAY_API_BASE_URL)
  console.log('PAY - process.env.PAY_RETURN_URL: ', process.env.PAY_RETURN_URL)

  axios
    .post('/v1/payments', {
      amount: (isFastTrack ? 1850 : 1000),
      reference: 'USER RESEARCH',
      description: (isFastTrack ? 'Blue badge application fee (fast track delivery)' : 'Blue badge application fee'),
      return_url: `${process.env.PAY_RETURN_URL}`
    })
    .then(response => {
      console.log('PAY - response.data.payment_id: ', response.data.payment_id)
      console.log('PAY - redirect link: ', response.data._links.next_url.href)
      res.cookie('paymentId', response.data.payment_id)

      const UPDATED_NEXT_URL = response.data._links.next_url.href.replace(
        process.env.PAY_TEST_FRONTEND_BASE_URL,
        process.env.PAY_FARGATE_FRONTEND_BASE_URL
      );

      console.log('PAY - return url: ', UPDATED_NEXT_URL)

      res.redirect(UPDATED_NEXT_URL)
    })
    .catch(function (error) {
      console.log(error)
    })
})

module.exports = router
