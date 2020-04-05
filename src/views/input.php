<?php
use yii\helpers\Html;

/**
 * @var string $id
 * @var string $inputField
 */
?>

<div id="<?= $id ?>" class="tree-input-dropdown">
    <?= Html::a(
        '<div class="text-left tree-input-list">loading...</div>',
        "#{$id}-dropdown-toggle",
        [
            'class' => 'btn btn-info btn-block tree-input-dropdown-toggle',
            'data-toggle' => 'collapse'
        ]
    ) ?>
    <div id="<?= $id ?>-dropdown-toggle" class="collapse tree-input-collapse panel panel-primary">
        <?= $this->render('tree') ?>
    </div>
    <?= $inputField ?>
</div>