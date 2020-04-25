<?php

use yii\helpers\ArrayHelper;
use yii\helpers\Html;

/**
 * @var array<string, mixed> $options
 */

$tag = ArrayHelper::remove($options, 'tag', 'div');
?>

<?= Html::beginTag($tag, $options); ?>
    <div class="row">
        <div class="col-xs-12 col-sm-6">
            <div class="panel panel-info">
                <?= $this->render('tree') ?>

                <div class="panel-footer">
                    <?= Html::button(Yii::t('kr0lik.tree', 'Insert'), ['class' => 'btn btn-sm btn-success tree-add', 'style' => 'display: none']) ?>
                    <?= Html::button(Yii::t('kr0lik.tree', 'Append'), ['class' => 'btn btn-sm btn-success tree-append', 'style' => 'display: none']) ?>
                    <?= Html::button(Yii::t('kr0lik.tree', 'Remove'), ['class' => 'btn btn-sm btn-danger tree-remove', 'style' => 'display: none']) ?>
                </div>
            </div>
        </div>
        <div class="col-xs-12 col-sm-6">
            <div class="panel panel-info">
                <div class="panel-heading">
                    <span class="tree-breadcrumbs"></span><span class="tree-update-name"></span>
                </div>
                <div class="tree-manager-form-container">
                    <div class="panel-body">

                    </div>
                </div>
            </div>
        </div>
    </div>
<?= Html::endTag($tag); ?>