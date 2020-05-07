<?php
use yii\helpers\{ArrayHelper, Html};

/**
 * @var array<string, mixed> $options
 * @var string $inputField
 * @var bool $collapse
 * @var array<string, string> $bsCssClasses
 */

$tag = ArrayHelper::remove($options, 'tag', 'div');
$id = ArrayHelper::getValue($options, 'id');
?>

<?= Html::beginTag($tag, $options); ?>
    <div class="tree-input-dropdown">
        <?= Html::a(
            '<div class="text-left tree-input-list">'.Yii::t('kr0lik.tree', 'Loading').'</div>',
            "#{$id}-dropdown-toggle",
            [
                'class' => 'btn btn-primary btn-block tree-input-dropdown-toggle',
                'data-toggle' => 'collapse'
            ]
        ) ?>
        <div id="<?= $id ?>-dropdown-toggle" class="<?= $collapse ? 'collapse ' : '' ?>tree-input-collapse tree-container <?= $bsCssClasses['container-class'] ?>">
            <?= $this->render('tree', ['bsCssClasses' => $bsCssClasses]) ?>
        </div>
        <?= $inputField ?>
    </div>
<?= Html::endTag($tag); ?>