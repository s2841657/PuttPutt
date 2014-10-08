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
					'text': 'Customer message:' +  msg +'\n' + 'How often do you play here:' + playhere +'\n' + 'Favorite course:' + favcourse +'\n' + 'Overall experience:' +overallexp +'\n' + 'Overall upkeep and cleanliness:' + overallclean +'\n' + 'Price of admission based on entertainment:' + overallprice +'\n' + 'Staff Service - was it friendly and helpful:' + staffexp +'\n' + 'How did you hear about us?:' + hear +'\n' + 'Would you like to recieve information on special offers:' + offer +'\n' + 'Additional comments:' + mobile,
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