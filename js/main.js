/**
 * Sets up Justified Gallery.
 */
if (!!$.prototype.justifiedGallery) {
  var options = {
    rowHeight: 140,
    margins: 4,
    lastRow: "justify"
  };
  $(".article-gallery").justifiedGallery(options);
}

$(document).ready(function() {

  /**
   * Shows the responsive navigation menu on mobile.
   */
  $("#header > #nav > ul > .icon").click(function() {
    $("#header > #nav > ul").toggleClass("responsive");
  });


  /**
   * Controls the different versions of  the menu in blog post articles 
   * for Desktop, tablet and mobile.
   */
  if ($(".post").length) {
    var menu = $("#menu");
    var nav = $("#menu > #nav");
    var menuIcon = $("#menu-icon, #menu-icon-tablet");

    /**
     * Display the menu on hi-res laptops and desktops.
     */
    if ($(document).width() >= 1440) {
      menu.show();
      menuIcon.addClass("active");
    }

    /**
     * Display the menu if the menu icon is clicked.
     */
    menuIcon.click(function() {
      if (menu.is(":hidden")) {
        menu.show();
        menuIcon.addClass("active");
      } else {
        menu.hide();
        menuIcon.removeClass("active");
      }
      return false;
    });

    /**
     * Add a scroll listener to the menu to hide/show the navigation links.
     */
    if (menu.length) {
      $(window).on("scroll", function() {
        var topDistance = menu.offset().top;

        // hide only the navigation links on desktop
        if (!nav.is(":visible") && topDistance < 50) {
          nav.show();
        } else if (nav.is(":visible") && topDistance > 100) {
          nav.hide();
        }

        // on tablet, hide the navigation icon as well and show a "scroll to top
        // icon" instead
        if ( ! $( "#menu-icon" ).is(":visible") && topDistance < 50 ) {
          $("#menu-icon-tablet").show();
          $("#top-icon-tablet").hide();
        } else if (! $( "#menu-icon" ).is(":visible") && topDistance > 100) {
          $("#menu-icon-tablet").hide();
          $("#top-icon-tablet").show();
        }
      });
    }

    /**
     * Show mobile navigation menu after scrolling upwards,
     * hide it again after scrolling downwards.
     */
    if ($( "#footer-post").length) {
      var lastScrollTop = 0;
      $(window).on("scroll", function() {
        var topDistance = $(window).scrollTop();

        if (topDistance > lastScrollTop){
          // downscroll -> show menu
          $("#footer-post").hide();
        } else {
          // upscroll -> hide menu
          $("#footer-post").show();
        }
        lastScrollTop = topDistance;

        // close all submenu"s on scroll
        $("#nav-footer").hide();
        $("#toc-footer").hide();
        $("#share-footer").hide();

        // show a "navigation" icon when close to the top of the page, 
        // otherwise show a "scroll to the top" icon
        if (topDistance < 50) {
          $("#actions-footer > #top").hide();
        } else if (topDistance > 100) {
          $("#actions-footer > #top").show();
        }
      });
    }
  }

  /**
   * Pagination jump functionality
   */
  $("#jump-btn").click(function() {
    var pageInput = $("#page-input");
    var pageNum = parseInt(pageInput.val());
    var totalPages = parseInt(pageInput.attr("max"));

    if (pageNum >= 1 && pageNum <= totalPages) {
      var url;
      if (pageNum === 1) {
        url = window.location.origin + window.location.pathname.replace(/\/page\/\d+\/?$/, '/').replace(/\/$/, '') + '/';
      } else {
        url = window.location.origin + window.location.pathname.replace(/\/page\/\d+\/?$/, '') + '/page/' + pageNum + '/';
      }
      window.location.href = url;
    } else {
      // Invalid page number, highlight input
      pageInput.css('border-color', '#ff6b6b');
      setTimeout(function() {
        pageInput.css('border-color', '');
      }, 2000);
    }
  });

  // Allow Enter key to trigger jump
  $("#page-input").keypress(function(e) {
    if (e.which === 13) { // Enter key
      $("#jump-btn").click();
    }
  });

  /**
   * TOC toggle functionality
   */
  $('#toc-toggle').click(function() {
    var toc = $('#toc');
    var icon = $(this).find('i');

    if (toc.is(':visible')) {
      toc.slideUp(200);
      icon.removeClass('fa-chevron-up').addClass('fa-list');
    } else {
      toc.slideDown(200);
      icon.removeClass('fa-list').addClass('fa-chevron-up');
    }
  });

  /**
   * TOC smooth scroll functionality
   */
  $('#toc a, #toc-footer a').click(function(e) {
    var targetHref = $(this).attr('href');

    if (targetHref && targetHref.startsWith('#')) {
      e.preventDefault();

      // Decode the URL-encoded href to match the actual element ID
      var decodedHref = decodeURIComponent(targetHref);
      var target = $(decodedHref);

      if (target.length) {
        var headerHeight = $('#header').outerHeight() || 0;
        var offset = target.offset().top - headerHeight - 20;

        $('html, body').animate({
          scrollTop: offset
        }, {
          duration: 500,
          easing: 'swing'
        });

        // Update URL hash without triggering scroll
        history.pushState(null, null, targetHref);
      }
    }
  });

});
