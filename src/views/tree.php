<?php
use yii\helpers\Html;

/**
 * @var array<string, string> $bsCssClasses
 */
?>

<div class="form-inline <?= $bsCssClasses['container-header-class'] ?> <?= $bsCssClasses['container-info-class'] ?>">
    <?= Html::textInput('tree-search-input', null, ['class' => 'form-control tree-search-input', 'placeholder' => Yii::t('kr0lik.tree', 'Search')]) ?>
    <?= Html::button('X', ['class' => 'btn btn-default tree-search-reset']) ?>
    <span class="tree-search-matches"></span>
</div>
<div class="<?= $bsCssClasses['container-body-class'] ?>">
    <div class="fancytree-connectors"></div>
</div>