const express = require('express')
const fs = require('fs')
const NotifyClient = require('notifications-node-client').NotifyClient
const path = require('path');
const notifyClient = new NotifyClient(process.env.NOTIFY_API_KEY)
const router = express.Router()


router.get('/backstage', function(req, res) {
    res.render('backstage/index.html');
});


router.post('/backstage/send-invite', function(req, res) {

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

  fs.readFile(
    path.resolve(__dirname, '../temp-blue-badge-v1.pdf'),
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


module.exports = router
