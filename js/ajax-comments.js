jQuery.extend(jQuery.fn, {
    validate: function () {
        if (jQuery(this).val().length < 3) {
            jQuery(this).addClass('error');
            return false
        } else {
            jQuery(this).removeClass('error');
            return true
        }
    },
    validateEmail: function () {
        var emailReg = /\S+@\S+\.\S+/,
            emailToValidate = jQuery(this).val();
        if (!emailReg.test(emailToValidate) || emailToValidate === "") {
            jQuery(this).addClass('error');
            return false
        } else {
            jQuery(this).removeClass('error');
            return true
        }
    },
});

jQuery(function ($) {
    $('#commentform').submit(function (e) {
        e.preventDefault()

        let respond = $('#respond'),
            commentlist = $('.commentlist'),
            cancelreplylink = $('#cancel-comment-reply-link'),
            author = $('#author'),
            email = $('#email'),
            comment = $('#comment');


        if (author.length) author.validate();

        if (email.length) email.validateEmail();

        comment.validate();

        if (!author.hasClass('error') && !email.hasClass('error') && !comment.hasClass('error')) {
            $.ajax({
                type: 'POST',
                url: test_ajax_comment_params.ajaxurl,
                data: $(this).serialize() + '&action=testajaxcomments',
                success: function (addedCommentHTML) {
                    if (commentlist.length > 0) {
                        if (respond.parent().hasClass('comment')) {
                            if (respond.parent().children('.children').length) {
                                respond.parent().children('.children').append(addedCommentHTML);
                            } else {
                                addedCommentHTML = '<ul class="children">' + addedCommentHTML + '</ul>';
                                respond.parent().find('.comment-body').after(addedCommentHTML);
                            }
                            cancelreplylink.trigger("click");
                        } else {
                            commentlist.append(addedCommentHTML);
                        }
                    } else {
                        addedCommentHTML = '<ol class="commentlist">' + addedCommentHTML + '</ol>';
                        respond.before($(addedCommentHTML));
                    }
                    comment.val('');
                },
                error: function (request, status, error) {
                    if (status === 500) {
                        alert('Error while adding comment');
                    } else if (status === 'timeout') {
                        alert('Error: Server doesn\'t respond.');
                    } else {
                        var wpErrorHtml = request.responseText.split("<p>"),
                            wpErrorStr = wpErrorHtml[1].split("</p>");

                        alert(wpErrorStr[0]);
                    }
                },

            });
        }
        return false;
    });
});

