function MapInputWidgetManager()
{

    const widgetSelector = '.garixi-map-input-widget';

    var self = this;

    var widgets = Array();

    var initializeWidget = function ( widgetContainer )
    {
        if ( ! $(widgetContainer).data('initialized') )
        {
            var widget = new MapInputWidget(widgetContainer);
            widget.initialize();
            return widget;
        }
        return null;
    };

    var addWidget = function ( widget )
    {
        var widgetId = widget.getId();
        widgets[widgetId] = widget;
    };

    this.initializeWidgets = function()
    {
        $(widgetSelector).each
        (
            function ( widgetIndex , widgetContainer )
            {
                var widget = initializeWidget(widgetContainer);
                currWidget = widget;
                if ( widget )
                {
                    addWidget(widget);
                }
            }
        );

    };

    this.getWidget = function ( widgetId )
    {
        var widget = widgets[widgetId];
        return widget;
    };

}

function MapInputWidget ( widget )
{

    const inputSelector = 'input.garixi-map-input-widget-input';

    const canvasSelector = 'div.garixi-map-input-widget-canvas';

    var self = this;

    var input;

    var canvas;

    //var map;

    var initializeComponents = function()
    {
        input = $(widget).find(inputSelector).get(0);
        canvas = $(widget).find(canvasSelector).get(0);
    };

    var initializeMap = function()
    {
        geocoder = new google.maps.Geocoder();

        map = new google.maps.Map
        (
            canvas,
            {
                mapTypeId: $(widget).data('map-type'),
                center: getInitialMapCenter(),
                zoom: $(widget).data('zoom'),
                styles:
                    [
                        {
                            featureType: "poi",
                            stylers:
                                [
                                    {
                                        visibility: "off",
                                    },
                                ],
                        },
                    ],
                mapTypeControlOptions :
                {
                    mapTypeIds:
                        [
                        ],
                },
            }
        );

        google.maps.event.addListener
        (
            map,
            'click',
            function ( click )
            {
                self.setPosition
                (
                    {
                        latitude: click.latLng.lat(),
                        longitude: click.latLng.lng(),
                    }
                );
            }
        );

    };

    var initializeWidget = function()
    {
        var point = getInitialValue();
        self.setPosition(point);
        $(widget).data('initialized',true);
    };

    var makePointString = function ( pointData )
    {
        var pattern = getPattern();
        var point = makePoint(pointData);
        pattern = pattern.replace(/%latitude%/g,point.lat());
        pattern = pattern.replace(/%longitude%/g,point.lng());
        return pattern;
    };

    var hasInitialValue = function()
    {
        var hasInitialValue = $(input).prop('value') != '';
        return hasInitialValue;
    };

    var getInitialValue = function()
    {
        var point;
        var pattern = getPattern();
        var pointString = $(input).prop('value');
        if ( pointString !== '' )
        {
            //  The function has an issue - it will not parse the initial value correctly
            //  if the pattern has more than one occurence of "%latitude%" or "%longitude%"
            //  in a row in the begining of the string.
            //  E.g. the initial value won't be parsed correctly against
            //  the pattern "%latitude% - %latitude% - %longitude%".
            var latitudePosition = pattern.indexOf('%latitude%');
            var longitudePosition = pattern.indexOf('%longitude%');
            var latitudeFirst = latitudePosition < longitudePosition;
            var latitudeIndex = latitudeFirst ? 0 : 1;
            var longitudeIndex = latitudeFirst ? 1 : 0;
            var latitude = pointString.match(/-?\d+(\.\d+)?/g)[latitudeIndex];
            var longitude = pointString.match(/-?\d+(\.\d+)?/g)[longitudeIndex];
            point = new google.maps.LatLng(latitude,longitude);
        }
        else
        {
            point = null;
        }
        return point;
    };

    var getInitialCenter = function()
    {
        var latitude = $(widget).data('latitude');
        var longitude = $(widget).data('longitude');
        var point = new google.maps.LatLng(latitude,longitude);
        return point;
    };

    var getInitialMapCenter = function()
    {
        var initialMapCenter;
        if ( hasInitialValue() )
        {
            initialMapCenter = getInitialValue();
        }
        else
        {
            initialMapCenter = getInitialCenter();
        }
        return initialMapCenter;
    };

    var getPattern = function()
    {
        var pattern = $(widget).data('pattern');
        return pattern;
    };

    // Constructs a point from latitude and langitude
    var makePoint = function ( pointData )
    {
        var point;
        if
            (
            pointData.latitude !== undefined
                &&
                pointData.longitude !== undefined
            )
        {
            var latitude = pointData.latitude;
            var longitude = pointData.longitude;
            point = new google.maps.LatLng(latitude,longitude);
        }
        else
        {
            point = pointData;
        }
        return point;
    }

    // Initializes widget
    this.initialize = function()
    {
        initializeComponents();
        initializeMap();
        initializeWidget();

    };

    // Returns widget identifier
    this.getId = function()
    {
        var id = $(widget).prop('id');
        return id;
    };

    // Sets the widget value to specified point;
    // Pans the map to the corresponding point;
    // Sets marker position to the corresponding point.
    this.setPosition = function ( pointData )
    {

        if ( map.marker )
        {
            map.marker.setMap(null);
        }

        if ( pointData === null )
        {
            // Disable the input in order not to send it in POST array
            $(input).prop('disabled',true);
            return;
        }
        else
        {
            // Enable the input in order to send in in POST array
            $(input).prop('disabled',false);
        }

        var point = makePoint(pointData);

        if ( $(widget).data('align-map-center') === 1 )
        {
            map.panTo(point);
        }

        var markerAnimation = null;
        if ( $(widget).data('animate-marker') === 1 )
        {
            markerAnimation = google.maps.Animation.DROP;
        }
        map.marker = new google.maps.Marker
        (
            {
                map: map,
                position: point,
                draggable: true,
                animation: markerAnimation,
            }
        );

        google.maps.event.addListener
        (
            map.marker,
            'dragend',
            function()
            {
                self.setPosition(this.getPosition());
            }
        );

        var pattern = $(widget).data('pattern');
        var pointString = makePointString(point);
        $(input).prop('value',pointString);


        /*
         //Aggiorba lat e lon
         $(".latitude").val(ui.item.latitude);
         $(".longitude").val(ui.item.longitude);

         */
        $(".latitude").val(point.lat());
        $(".longitude").val(point.lng());

        console.log('spostato a ' + point.H + ' e '+ point.L);


    };

    // Pans the map the the specified point
    this.panTo = function ( pointData )
    {
        var point = makePoint(pointData);
        map.panTo(point);
    };

    // Sets the map zoom to a specified value
    this.setZoom = function ( zoom )
    {
        map.setZoom(zoom);
    };


};

// A global instance of map inputs manager.
// Use it to get references to widget instances.
var mapInputWidgetManager;
var map;
$(window).load
(
    function()
    {

        // Create an instance of widget manager
        mapInputWidgetManager = new MapInputWidgetManager();

        // Initialize widgets
        mapInputWidgetManager.initializeWidgets();

        $("#addresscompletion").autocomplete({
            //This uses the geocoder to fetch the address values
            messages: {
                noResults: 'Nessun indirizzo trovato',
                results: function() {
                    //return 'Trovati dei risultati usa le freccie per scegliere';
                    return '';
                }
            },
            source: function(request, response) {
                geocoder.geocode( {'address': request.term }, function(results, status) {
                    response($.map(results, function(item) {
                        return {
                            label:  item.formatted_address,
                            value: item.formatted_address,
                            latitude: item.geometry.location.lat(),
                            longitude: item.geometry.location.lng(),
                            components: item.address_components,
                        }
                    }));
                })
            },
            //This is executed upon selection of an address
            select: function(event, ui) {
                var location = new google.maps.LatLng(ui.item.latitude, ui.item.longitude);

                $("input.latitude").val(ui.item.latitude);
                $("input.longitude").val(ui.item.longitude);

                // https://developers.google.com/maps/documentation/geocoding/?hl=fr#Types
                var components = ui.item.components;
                var street_number = '';
                var street_name = '';
                for (var i = 0, component; component = components[i]; i++) {
                    console.log(component);
                    if (component.types[0] == 'locality') {
                        $('.city').val(component['long_name']);
                    }
                    if (component.types[0] == 'route') {
                        //$('.address').val(component['short_name']);
                        street_name = component['short_name'];

                    }

                    if (component.types[0] == 'street_number') {
                        //$('.address').val(component['short_name']);
                        street_number = component['short_name'];

                    }
                    if (component.types[0] == 'country') {
                        $('.country').val(component['long_name']);
                    }
                }
                $('.address').val(street_name + ' ' +street_number);


                //map.marker.setPosition(location);
                currWidget.setPosition(location);
                map.setCenter(location);
                map.setZoom(16);
            }
        });
        //console.log("Aggiunto autocompletion");

        $(window).resize(function() {
            setTimeout(function() {
                google.maps.event.trigger(map, 'resize');
            }, 300)

        });
    }
);
