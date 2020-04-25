<?php
use yii\base\Model;
use yii\widgets\ActiveForm;
use yii\helpers\Html;

/**
 * @var Model             $model
 * @var string            $nameField
 * @var string            $actionUrl
 * @var string[]|callable $fields
 * @var string[]|callable $links
 */
?>

<?php $form = ActiveForm::begin([
    'id' => "tree-manager-edit-form",
    'action' => $actionUrl
]); ?>
    <div class="panel-body">
        <?= $form->field($model, $nameField)->textInput(['class' => 'tree-form-input-name form-control']) ?>
        <?php if ($fields): ?>
            <?php foreach ($fields as $field): ?>
                <?php if (is_callable($field)): ?>
                    <?= $field($form, $model); ?>
                <?php else: ?>
                    <?= $form->field($model, $field)->textInput(); ?>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>
    <div class="panel-footer">
        <?= Html::submitButton(Yii::t('kr0lik.tree', 'Save'), ['class' => 'btn btn-sm btn-success tree-form-submit']) ?>
        <?= Html::button(Yii::t('kr0lik.tree', 'Cancel'), ['class'=>'btn btn-sm btn-danger tree-form-cancel']) ?>

        <?php if ($links): ?>
            <?php foreach ($links as $link): ?>
                <?php if (is_callable($link)): ?>
                    <?= $link($model); ?>
                <?php else: ?>
                    <?= $link; ?>
                <?php endif; ?>
            <?php endforeach; ?>
        <?php endif; ?>

        <div class="tree-form-error text-danger"></div>
    </div>
<?php ActiveForm::end(); ?>
