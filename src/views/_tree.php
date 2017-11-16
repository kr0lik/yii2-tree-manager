<?php
use yii\helpers\Html;
?>

<div class="panel panel-info tree-container">
    <?php if (! isset($treeOptions['filter']) || $treeOptions['filter']): ?>
        <div class="panel-heading form-inline">
            <?= Html::textInput('tree-search-input', null, ['class' => 'form-control tree-search-input', 'placeholder' => 'Искать..']) ?>
            <?= Html::button('X', ['class' => 'btn btn-default tree-search-reset']) ?>
        </div>
    <?php endif; ?>

    <div class="panel-body">
        <div id="<?= $id ?>"></div>
    </div>
    <?php if (! isset($treeOptions['useEditForm']) || $treeOptions['useEditForm']): ?>
        <div class="panel-footer">
            <?= Html::button('Добавить', ['class' => 'btn btn-sm btn-success tree-add-new-category']) ?>
            <?= Html::button('Удалить', ['class' => 'btn btn-sm btn-danger tree-remove-single-category']) ?>
        </div>
    <?php endif; ?>
</div>
