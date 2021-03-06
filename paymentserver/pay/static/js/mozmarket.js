/*
This JS would be hosted by the Mozilla Marketplace to facilitate in-app purchases.
*/
(function(exports) {
"use strict";

exports.buy = function(signedRequest, onPaySuccess, onPayFailure, options) {
    var defaults = {clickTarget: null};
    options = $.extend(defaults, options || {});
    var $target = $(options.clickTarget),
        transactionId;

    $(options.clickTarget).popover({
        header: '#pay-dialog > .p-header',
        content: '#pay-dialog > .p-content',
        processPayment: function(closeModal) {
            var $dialog = $('.popover.active'),
                paymentChoice = $dialog.find('.payment_method:checked').val();
                // form = $dialog.find('form.moz-payment').serialize();
            $.ajax({url: $('#pay-dialog').attr('data-submit-url'),
                    type: 'POST',
                    data: {signed_request: signedRequest,
                           transaction_id: transactionId,
                           payment_choice: paymentChoice,
                           csrfmiddlewaretoken: $dialog.find('[name=csrfmiddlewaretoken]').val()},
                    dataType: 'json',
                    success: function(data, textStatus, jqXHR) {
                        if (paymentChoice == 'paypal') {
                            $.ajax({type: 'GET',
                                    url: '/get_embedded_payment_form',
                                    dataType: 'html',
                                    success: function(data, textStatus, jqXHR) {
                                        $dialog.find('.p-content').html(data);
                                    },
                                    error: function(jqXHR, textStatus, errorThrown) {
                                        console.log("failure");
                                        console.log(textStatus);
                                    }});
                        } else {
                            // Simulate immediate carrier payment.
                            closeModal();
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log("failure");
                        console.log(textStatus);
                    }});
        }
    });

    $target.trigger('openpaydialog');

    $.ajax({url: $('#pay-dialog').attr('data-start-url'),
            type: 'POST',
            data: {signed_request: signedRequest,
                   csrfmiddlewaretoken: $('.popover').find('[name=csrfmiddlewaretoken]').val()},
            dataType: 'json',
            success: function(data, textStatus, jqXHR) {
                var $dialog = $('.popover.active');
                transactionId = data.transaction_id;
                $dialog.find('p.action').text("Pay $" + data.request.price + " to seller for '" + data.request.name + "'");
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log("failure");
                console.log(textStatus);
            }});
};

})(typeof exports === 'undefined' ? (this.mozmarket = {}) : exports);
