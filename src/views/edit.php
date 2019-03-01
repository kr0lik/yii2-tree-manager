<?php
use yii\widgets\ActiveForm;
use yii\helpers\{Html, Url, ArrayHelper};
?>

<div class="panel panel-info">
    <div class="panel-heading">
        <?php if ($category->id): ?>
            <?= implode(' >> ', ArrayHelper::map($category->getParents()->sorted()->all(), 'id', 'name')) ?>
            <?= $category->level() > 0 ? ' >> ' : '' ?>
            <strong><?= $category->name ?></strong>
        <?php else: ?>
            ...
        <?php endif; ?>
    </div>
    <?php $form = ActiveForm::begin([
        'action' => Url::to(['', 'action' => 'load', 'targetId' => $category->id, 'hitId' => $hitId])
    ]); ?>
        <div class="panel-body">
            <?= $form->field($category, 'name') ?>
            <?php if ($fields): ?>
                <?= $this->render($fields, ['form' => $form, 'model' => $category]); ?>
            <?php endif; ?>
        </div>
        <div class="panel-footer">
            <?= Html::submitButton('Сохранить', ['class' => 'btn btn-sm btn-warning tree-form-edit-save']) ?>
            <?= Html::button('Отмена', ['class'=>'btn btn-sm btn-danger tree-form-edit-cancel']) ?>

            <?php if ($buttons): ?>
                <?= $this->render($buttons, ['form' => $form, 'model' => $category]); ?>
            <?php endif; ?>
        </div>
    <?php ActiveForm::end(); ?>
</div>
