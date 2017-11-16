<?php
use yii\helpers\Html;
?>

<div class="tree-input-dropdown<?= $absolute ? ' tree-input-absolute' : '' ?>">
    <?= Html::a('loading...', "#tree-input-dropdown-toggle-{$id}", ['class' => 'btn btn-info tree-input-dropdown-toggle', 'data-toggle' => 'collapse']) ?>
    <div id="tree-input-dropdown-toggle-<?= $id ?>" class="collapse tree-input-collapse">
        <?= $this->render('_tree', ['id' => $id, 'treeOptions' => $treeOptions]) ?>
    </div>
</div>