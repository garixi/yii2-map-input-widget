<?php

use yii\helpers\Html;
use yii\helpers\Url;

// Register asset bundle
\garixi\yii2\assets\MapInputAsset::register($this);

// [BEGIN] - Map input widget container
echo
    '<div class="input-group">
        <span class="input-group-addon" ><span class="glyphicon glyphicon-search" aria-hidden="true"></span></span>
        <input id="addresscompletion" class="form-control input-md" placeholder="'.Yii::t('app',"Type an address").'">
    </div>';

echo Html::beginTag(
    'div',
    [
        'class' => 'garixi-map-input-widget',
        'style' => "width: $width; height: $height;",
        'id' => $id,
        'data' =>
        [
            'latitude' => $latitude,
            'longitude' => $longitude,
            'zoom' => $zoom,
            'pattern' => $pattern,
            'map-type' => $mapType,
            'animate-marker' => $animateMarker,
            'align-map-center' => $alignMapCenter,
        ],
    ]
);

    // The actual hidden input
    echo Html::activeHiddenInput(
        $model,
        $attribute,
        [
            'class' => 'garixi-map-input-widget-input',
        ]
    );

    // Map canvas
    echo Html::tag(
        'div',
        '',
        [
            'class' => 'garixi-map-input-widget-canvas',
            'style' => "width: 100%; height: 100%",
        ]
    );

// [END] - Map input widget container
echo Html::endTag('div');
