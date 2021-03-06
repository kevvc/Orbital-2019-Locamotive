Template.plan.rendered = function() {

}

Template.plan.events({
    "click .download-btn": function(event) {
        var scaleBy = 5;
        var w = 1000;
        var h = 1000;
        var div = document.querySelector('#screen');
        var canvas = document.createElement('canvas');
        canvas.width = w * scaleBy;
        canvas.height = h * scaleBy;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        var context = canvas.getContext('2d');
        context.scale(scaleBy, scaleBy);

        html2canvas(document.getElementById('calendar')).then(function(canvas) {
            theCanvas = canvas;
            /*
            document.body.appendChild(canvas);
            Canvas2Image.saveAsPNG(canvas);
            $(body).append(canvas);
            */
            canvas.toBlob(function(blob) {
                saveAs(blob, "pretty image.png");
            });
        });
        return false;
    },

    "keyup .eventSearch": function(event) {
        var input, filter, ul, li, a, i, txtValue;
        input = document.getElementById('eventSearch');
        filter = input.value.toUpperCase();
        ul = document.getElementById("eventUL");
        li = ul.getElementsByTagName('li');
        for (i = 0; i < li.length; i++) {
            a = li[i].getElementsByTagName("div")[0];
            txtValue = a.textContent;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                li[i].style.display = "";
            } else {
                li[i].style.display = "none";
            }
        }
        return false;
    }

});

Template.plan.onRendered(() => {

    /* initialize the external events
    -----------------------------------------------------------------*/
    $('#external-events .fc-event').each(function() {

        // store data so the calendar knows to render an event upon drop
        $(this).data('event', {
            title: $.trim($(this).text()), // use the element's text as the event title
            stick: true // maintain when user navigates (see docs on the renderEvent method)
        });

        // make the event draggable using jQuery UI
        $(this).draggable({
            zIndex: 999,
            revert: true,      // will cause the event to go back to its
            revertDuration: 0  //  original position after the drag
        });

    });
    
    /* initialize the calendar
    -----------------------------------------------------------------*/
    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    var Data = PlannerData.findOne({}, { sort: { createdAt: -1 }}, { limit: 1});
    var startDate = new Date(Data.startDate); 
    var Day = startDate.getDay();


    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,timelineDay'
        },
        validRange: {
            start: '2019-07-01',
            end: '2019-07-10'
        },
        //defaultDate: '2019-07-01',
        defaultDate: startDate,
        defaultView: 'agendaWeek',
        minTime: "06:00",
        contentHeight: 'auto',
        columnHeader: false,
        aspectRatio: 1.5,
        editable: true,
        droppable: true, // this allows things to be dropped onto the calendar
        create: true,
        eventTextColor: 'white',
        allDaySlot: false,
        firstDay: Day,
        //eventBackgroundColor: getRandomColor(),
        events: [{
            id: 1,
            title: 'Birthday',
            start: new Date(y, m, 1),
            allDay: true,
            description: 'Happy Birthday',
        }],
        drop: function() {
            // is the "remove after drop" checkbox checked?
            if ($('#drop-remove').is(':checked')) {
                // if so, remove the element from the "Draggable Events" list
                $(this).remove();
            }
        },
        
        eventDragStop: function( event, jsEvent, ui, view ) {
            if(isEventOverDiv(jsEvent.clientX, jsEvent.clientY)) {
                $('#calendar').fullCalendar('removeEvents', event._id);
                var el = $( "<li class='fc-event'>" ).appendTo( '#external-events-listing' ).text( event.title );
                el.draggable({
                  zIndex: 999,
                  revert: true, 
                  revertDuration: 0 
                });
                el.data('event', { title: event.title, id :event.id, stick: true });
            }
        }
        
    });
  
    var isEventOverDiv = function(x, y) {

        var external_events = $( '#external-events' );
        var offset = external_events.offset();
        offset.right = external_events.width() + offset.left;
        offset.bottom = external_events.height() + offset.top;

        // Compare
        if (x >= offset.left
            && y >= offset.top
            && x <= offset.right
            && y <= offset .bottom) { return true; }
        return false;

    }
    
    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
});
