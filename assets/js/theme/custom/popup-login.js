import $ from 'jquery';
import nod from '../common/nod';
import forms from '../common/models/forms';
import { classifyForm } from '../common/utils/form-utils';
import utils from '@bigcommerce/stencil-utils';

/* ==========================================================
    ## handle loggin in via ajax
    ========================================================== */
const submitLoginForm = () => {
    $('.modal--popupLoginWindow .loadingOverlay').show(); // show loading screen
    const formData = {
        login_email: $('#popupLoginWindowForm #login_email').val().trim(), // wanted to keep same ID as main login fields so can be autopopulated easily
        login_pass: $('#popupLoginWindowForm #login_pass').val().trim(), // wanted to keep same ID as main login fields so can be autopopulated easily
    };
    $.post('/login.php?action=check_login', formData, (data) => {
        // if get a response
        if (data.length) {
            // check for logged in
            utils.api.getPage('/account.php', { template: 'custom/popup-login-window-customer-id' }, (err, response) => {
                // trim necessary b/c it was giving back whitespace as the response if we got a
                // response back from the account page, we're logged in
                if (response.trim().length) {
                    $('.modal--popupLoginWindow .loadingOverlay, #popupLoginWindowForm').hide(); // hide loading and form itself
                    $('.modal--popupLoginWindow .alertBox--success').slideDown(); // ser is now logged in
                    setTimeout(() => {
                        // $('#popupLoginWindowForm').foundation('reveal', 'close'); // close modal after 2.5 seconds
                        // or just reload the page
                        // window.location.reload();
                        const redirecturl = $('body').hasClass('qrb__trigger-was-clicked')
                            ? `${window.location.href}?qrb_open=true`
                            : window.location.href;
                        window.location.href = redirecturl;
                    }, 2500);
                } else {
                    $('.modal--popupLoginWindow .loadingOverlay').hide(); // hide loading
                    $('.modal--popupLoginWindow .alertBox--error').slideDown();
                }
            });
        } else {
            $('.modal--popupLoginWindow .loadingOverlay').hide(); // hide loading
            $('.modal--popupLoginWindow .alertBox--error').slideDown();
        }
    });
};


/* ==========================================================
## handle validating the form fields
========================================================== */
const registerLoginValidation = ($loginForm) => {
    const loginModel = forms;

    const loginValidator = nod({
        submit: '#popupLoginWindowForm input[type="submit"]',
    });

    loginValidator.add([
        {
            selector: '#popupLoginWindowForm input[name="login_email"]',
            validate: (cb, val) => {
                const result = loginModel.email(val);

                cb(result);
            },
            errorMessage: 'Please use a valid email address, such as user@example.com.',
        },
        {
            selector: '#popupLoginWindowForm input[name="login_pass"]',
            validate: (cb, val) => {
                const result = loginModel.password(val);

                cb(result);
            },
            errorMessage: 'You must enter a password.',
        },
    ]);

    $loginForm.submit((event) => {
        event.preventDefault();
        $('.modal--popupLoginWindow .alertBox').slideUp(); // get rid of any previous errors
        loginValidator.performCheck();

        if (loginValidator.areAll('valid')) {
            submitLoginForm();
        }
    });
};


const popupLoginWindow = ({ itsConfig }) => {
    const $loginForm = classifyForm('#popupLoginWindowForm');

    if (itsConfig.popup_login && $loginForm.length) {
        console.log('IntuitSolutions.net - Popup Login Window'); // eslint-disable-line

        registerLoginValidation($loginForm);
    }
};


export default popupLoginWindow;
