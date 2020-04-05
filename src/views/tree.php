<?php
use yii\helpers\Html;
?>

<div class="tree-container">
    <div class="panel-heading form-inline">
        <?= Html::textInput('tree-search-input', null, ['class' => 'form-control tree-search-input', 'placeholder' => Yii::t('kr0lik.tree', 'Search...')]) ?>
        <?= Html::button('X', ['class' => 'btn btn-default tree-search-reset']) ?>
        <span class="tree-search-matches"></span>
    </div>
    <div class="panel-body">
        <div class="fancytree-connectors"></div>
    </div>
</div>