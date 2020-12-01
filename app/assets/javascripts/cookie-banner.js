// https://github.com/alphagov/govuk_publishing_components/blob/19f17b858c939ec82a3de910751db8e482e65dcd/app/assets/javascripts/govuk_publishing_components/components/cookie-banner.js

window.GOVUK = window.GOVUK || {}
window.GOVUK.Modules = window.GOVUK.Modules || {};

(function (Modules) {
  function CookieBanner () { }

  CookieBanner.prototype.start = function ($module) {
    this.$module = $module[0]
    this.$module.hideCookieMessage = this.hideCookieMessage.bind(this)
    this.$module.showConfirmationMessage = this.showConfirmationMessage.bind(this)
    this.$module.setCookieConsent = this.setCookieConsent.bind(this)
    this.$module.setRejectCookieConsent = this.setRejectCookieConsent.bind(this)

    this.$module.cookieBanner = document.querySelector('.gem-c-cookie-banner')
    this.$module.cookieBannerConfirmationMessage = this.$module.querySelector('.gem-c-cookie-banner__confirmation')
    this.$module.cookieBannerConfirmationMessageAccept = this.$module.querySelector('.gem-c-cookie-banner__confirmation-message--accept')
    this.$module.cookieBannerConfirmationMessageReject = this.$module.querySelector('.gem-c-cookie-banner__confirmation-message--reject')
    this.setupCookieMessage()
  }

  CookieBanner.prototype.setupCookieMessage = function () {
    this.$hideLinks = this.$module.querySelectorAll('button[data-hide-cookie-banner]')
    if (this.$hideLinks && this.$hideLinks.length) {
      for (var i = 0; i < this.$hideLinks.length; i++) {
        this.$hideLinks[i].addEventListener('click', this.$module.hideCookieMessage)
      }
    }

    this.$acceptCookiesLink = this.$module.querySelector('button[data-accept-cookies]')
    if (this.$acceptCookiesLink) {
      this.$acceptCookiesLink.addEventListener('click', this.$module.setCookieConsent)
    }

    this.$rejectCookiesLink = this.$module.querySelector('button[data-reject-cookies]')
    if (this.$rejectCookiesLink) {
      this.$rejectCookiesLink.addEventListener('click', this.$module.setRejectCookieConsent)
    }

    this.showCookieMessage()
  }

  CookieBanner.prototype.showCookieMessage = function () {
    // Show the cookie banner if not in the cookie settings page or in an iframe
    if (!this.isInCookiesPage() && !this.isInIframe()) {
      var shouldHaveCookieMessage = (this.$module && window.GOVUK.cookie('cookies_preferences_set') !== 'true')

      if (shouldHaveCookieMessage) {
        this.$module.style.display = 'block'
      } else {
        this.$module.style.display = 'none'
      }
    } else {
      this.$module.style.display = 'none'
    }
  }

  CookieBanner.prototype.hideCookieMessage = function (event) {
    if (this.$module) {
      this.$module.style.display = 'none'
      window.GOVUK.cookie('cookies_preferences_set', 'true', { days: 365 })
    }

    if (event.target) {
      event.preventDefault()
    }
  }

  CookieBanner.prototype.setCookieConsent = function () {
    this.$module.showConfirmationMessage('accept')
    this.$module.cookieBannerConfirmationMessage.focus()
    window.GOVUK.cookie('cookies_preferences_set', 'true', { days: 365 })
    if (window.GOVUK.analyticsInit) {
      window.GOVUK.analyticsInit()
    }
    if (window.GOVUK.globalBarInit) {
      window.GOVUK.globalBarInit.init()
    }
  }

  CookieBanner.prototype.setRejectCookieConsent = function () {
    this.$module.showConfirmationMessage('reject')
    this.$module.cookieBannerConfirmationMessage.focus()
    window.GOVUK.cookie('cookies_preferences_set', 'true', { days: 365 })
  }

  CookieBanner.prototype.showConfirmationMessage = function (consentType) {
    if (consentType === "accept") {
      this.$module.cookieBannerConfirmationMessageAccept.style.display = 'block'
    } else if (consentType === "reject") {
      this.$module.cookieBannerConfirmationMessageReject.style.display = 'block'
    }

    this.$cookieBannerMainContent = document.querySelector('.gem-c-cookie-banner__wrapper')

    this.$cookieBannerMainContent.style.display = 'none'
    this.$module.cookieBannerConfirmationMessage.style.display = 'block'
  }

  CookieBanner.prototype.listenForCrossOriginMessages = function () {
    window.addEventListener('message', this.receiveMessage.bind(this), false)
  }

  CookieBanner.prototype.isInCookiesPage = function () {
    return window.location.pathname === '/help/cookies'
  }

  CookieBanner.prototype.isInIframe = function () {
    return window.parent && window.location !== window.parent.location
  }

  Modules.CookieBanner = CookieBanner
})(window.GOVUK.Modules)
