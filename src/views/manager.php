<?php
use yii\helpers\Html;

/**
 * @var string $id
 */
?>

<div id="<?= $id ?>" class="row tree-manager-widget">
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
    <div class="col-xs-12 col-sm-6 tree-manager-form-container">

    </div>
</div>
