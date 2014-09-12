$(document).ready(function(){
  $("address").each(function(){                         
    var embed ="<iframe width='425' height='350' frameborder='0' scrolling='no'  marginheight='0' marginwidth='0'   src='https://www.google.com/maps/embed/v1/place?key=AIzaSyBHDbyc9TApTKqHTu-hjqb_CXY_6s8bqhQ
            &q=putt+putt+in+mermaid+beach&zoom=16"+ encodeURIComponent( $(this).text() ) +"&amp;output=embed&iwloc'></iframe>";
                                $(this).html(embed);
                             
   });
});