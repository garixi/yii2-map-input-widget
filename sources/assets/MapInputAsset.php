<?php

namespace garixi\yii2\assets;

class MapInputAsset extends \yii\web\AssetBundle
{

    public static $key;

    public $sourcePath = '@garixi/yii2-map-input-widget/sources/web';

    public $depends =
    [
        'yii\web\JqueryAsset',
    ];

    public $jsOptions =
    [
        'position' => \yii\web\View::POS_END,
    ];

    public function __construct($config = [])
    {
        $this->js[] = $this->getGoogleMapScriptUrl();
        $this->js[] = "http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.2/jquery-ui.min.js";

        if (YII_DEBUG) {
            $this->js[] = 'js/map-input-widget.js';

        } else {
            $this->js[] = 'js/map-input-widget.min.js';
        }
        parent::__construct($config);
    }

    private function getGoogleMapScriptUrl()
    {
        $protocol = \Yii::$app->request->isSecureConnection ? "https" : "http";
        $scriptUrl  =  $protocol . "://maps.googleapis.com/maps/api/js?";
        $scriptUrl .= http_build_query([
            'key' => self::$key,'sensor' => 'false',
        ]);
        return $scriptUrl;
    }
}
