(function(){
    
    //  Cache some elems
    window.uxdHeader = {
        loaded : false,
        $el : $('div#uxd_header') 
    };
    
    // Suggest to include this snippet sitewide then use "vertical-centered" class where needed.
    window.vce = {
    
        verticalCenterOffset : function(parentHeight, childHeight){
            if (typeof parentHeight != 'Number') parentHeight = parseInt(parentHeight);
            if (typeof childHeight != 'Number') childHeight = parseInt(childHeight);
            return parseInt((parentHeight - childHeight) / 2);
        },

        verticalCenterElement: function(element){

            // For usage as event handler
            if (typeof element.data !== 'undefined' && element.data.element !== 'undefined') element = element.data.element;
            
            var offset = 0;
            var $el = $(element);
            
            if (typeof $el.attr('offset') != 'undefined') offset = parseInt($el.attr('offset'));
            
            element.style.marginTop = vce.verticalCenterOffset(
                $el.parent().height() - offset, 
                $el.outerHeight()
              ) + 'px';
        },

        verticalCenterElements: function(){
          $('.vertical-centered').each(function(){
            var t = $(this);
            if (
                this.tagName.toLowerCase() == 'img' && // If is an image element
                !(this.complete || (typeof this.naturalWidth != 'undefined' && this.naturalWidth !== 0)) && // And it's not loaded
                !t.data('vc-scheduled') // And there's no vertical-centering callback waiting for it to complete loading already
            ) 
            {
                // Set verticalCenterElement as a callback on this image element for once it finishes loading
                t.data('vc-scheduled', true).on('load', {element: this}, verticalCenterElement);
                return;
            } else {
                vce.verticalCenterElement(this);
            }
          });
        }
    };
    
    
    $(document).on('ready', function(){
        $('body').addClass('page-ready');
        $(document).foundation(); // Initialize Foundation equalizer first!
        setTimeout(vce.verticalCenterElements, 150);
    });
    
    
    $(window).resize(function(){
        // IMPORTANT NOTE: setTimeout 150ms on DOM resize actions b/c sometimes called before window finishes resizing.
        setTimeout(vce.verticalCenterElements, 150); 
    }).on('load', function(){
        setTimeout(vce.verticalCenterElements, 150);
    });
    
    
})();


    