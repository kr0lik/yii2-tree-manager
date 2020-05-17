<?php

use yii\helpers\ArrayHelper;
use yii\helpers\Html;

/**
 * @var array<string, mixed> $options
 * @var array<string, string> $bsCssClasses
 * @var string[] $buttons
 */

$tag = ArrayHelper::remove($options, 'tag', 'div');
?>

<?= Html::beginTag($tag, $options); ?>
    <div class="row">
        <div class="col-xs-12 col-md-6">
            <div class="tree-container <?= $bsCssClasses['container-class'] ?>">
                <?= $this->render('tree', ['bsCssClasses' => $bsCssClasses]) ?>

                <div class="<?= $bsCssClasses['container-footer-class'] ?>">
                    <?= Html::button(Yii::t('kr0lik.tree', 'Insert'), ['class' => 'btn btn-sm btn-success tree-add', 'style' => 'display: none']) ?>
                    <?= Html::button(Yii::t('kr0lik.tree', 'Append'), ['class' => 'btn btn-sm btn-success tree-append', 'style' => 'display: none']) ?>
                    <?= Html::button(Yii::t('kr0lik.tree', 'Remove'), ['class' => 'btn btn-sm btn-danger tree-remove', 'style' => 'display: none']) ?>
                    <?= implode(' ', $buttons) ?>
                </div>
            </div>
        </div>
        <div class="col-xs-12 col-md-6">
            <div class="<?= $bsCssClasses['container-class'] ?>">
                <div class="<?= $bsCssClasses['container-header-class'] ?> <?= $bsCssClasses['container-default-class'] ?>">
                    <span class="tree-node-breadcrumbs"></span><span class="tree-node-name"></span>
                    <?= Html::button(
                        '<i class="fa fa-sync"></i>',
                        [
                            'class' => 'btn btn-xs pull-right float-right tree-form-reload '.$bsCssClasses['btn-default-class'],
                            'style' => 'display: none'
                        ]
                    ) ?>
                </div>
                <div class="tree-manager-form-container">
                    <div class="<?= $bsCssClasses['container-body-class'] ?>">

                    </div>
                </div>
            </div>
        </div>
    </div>
<?= Html::endTag($tag); ?>