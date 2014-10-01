jQuery(function($)  
{
    $("#contact_form").submit(function()
    {
        var email = $("#email").val(); // get email field value
        var name = $("#name").val(); // get name field value
        var mobile = $("#mobile").val(); // get message field value
        var msg = $("#msg").val(); // get message field value
        var playhere = $('.playheres:checked').first().val();
        var favcourse = $('.favcourses:checked').first().val();
        var overallexp = $('.overallexps:checked').first().val();
        var overallclean = $('.overallcleans:checked').first().val();
        var overallprice = $('.overallprices:checked').first().val();
        var staffexp = $('.staffexps:checked').first().val();
        var hear = $('.hears:checked').first().val();
        var offer = $('.offers:checked').first().val();
        $.ajax(
        {
            type: "POST",
            url: "https://mandrillapp.com/api/1.0/messages/send.json",
            data: {
                'key': 'Fm7CkIWNFIi76r2aKTOZgQ',
                'message': {
                    'from_email': email,
                    'from_name': name,
                    'headers': {
                        'Reply-To': email
                    },
                    'subject': 'Website Contact Form Submission',
                    'text': msg +'\n' + playhere + favcourse + overallexp + overallclean + overallprice + staffexp + hear + offer + mobile,
                    'to': [
                    {
                        'email': 'joshua.mccure@griffithuni.edu.au',
                        'name': 'Joshua McCure',
                        'type': 'to'
                    }]
                }
            }
        })
        .done(function(response) {
            alert('Your message has been sent. Thank you!'); // show success message
            $("#name").val(''); // reset field after successful submission
            $("#email").val(''); // reset field after successful submission
            $("#msg").val(''); // reset field after successful submission
        })
        .fail(function(response) {
            alert('Error sending message.');
        });
        return false; // prevent page refresh
    });
});