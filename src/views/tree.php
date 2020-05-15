<?php
use yii\helpers\Html;

/**
 * @var array<string, string> $bsCssClasses
 */
?>

<div class="form-inline <?= $bsCssClasses['container-header-class'] ?> <?= $bsCssClasses['container-default-class'] ?>">
    <div class="form-group">
        <?= Html::textInput('tree-search-input', null, ['class' => 'form-control tree-search-input', 'placeholder' => Yii::t('kr0lik.tree', 'Search')]) ?>
    </div>
    <div class="form-group">
        <?= Html::button('X', ['class' => 'btn btn-default tree-search-reset']) ?>
        <span class="tree-search-matches rounded bg-info pl-2 pr-2" style="display: none;"></span>
    </div>
</div>
<div class="<?= $bsCssClasses['container-body-class'] ?>">
    <div class="fancytree-connectors"></div>
</div>