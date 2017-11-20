<?php
namespace kr0lik\tree;

use yii\widgets\InputWidget;
use yii\helpers\{Html, Json};

class TreeInput extends InputWidget
{
    /**
     * Tree Input options
     * [
     *      pathAction => // Path to your action script. Required
     *      messages => [
     *          newCategory: 'Новая категория',
     *          youNotChooseCategory: 'Вы не выбрали категорию из списка',
     *          categoryNotChoose: 'Не выбрана категория.',
     *          categoryHasChildren: 'У категории есть вложенные категории.',
     *          deleteCategory: 'Удалить категорию "{categoryName}"?',
     *          cantDeleteCategory: 'Не удалось удлаить категорию.',
     *          cantCreateRootCategory: 'Нельзя создать корневую категорию'
     *      ],
     *      // Search
     *      filter => [
     *          autoApply: true, // Re-apply last filter if lazy data is loaded
     *          autoExpand: true, // Expand all branches that contain matches while filtered
     *          counter: true, // Show a badge with number of matching child nodes near parent icons
     *          fuzzy: true, // Match single characters in order, e.g. 'fb' will match 'FooBar'
     *          hideExpandedCounter: false, // Hide counter badge if parent is expanded
     *          hideExpanders: false, // Hide expanders if all child nodes are hidden by filter
     *          highlight: true, // Highlight matches by wrapping inside <mark> tags
     *          leavesOnly: false, // Match end nodes only
     *          nodata: true, // Display a 'no data' status node if result is empty
     *          mode: "hide" // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
     *      ],
     *      firstNodeDefault => true, // Select first node on init, if has not active node
     *      highlightQuantity => true, // Highlight quantity by wrapping inside <small> tags, if name of node like: "some name (quantity)", where quantity is numeric. See TreeManagerAction -> treeQueryScopes
     *      multiple => false // Select multiple nodes
     * ]
     *
     * @var array
     */
    public $treeOptions = [];

    /**
     * Tree container slid down absolute position
     *
     * @var bool
     */
    public $absolute = true;

    public function init()
    {
        if (! isset($this->treeOptions['pathAction']) || ! $this->treeOptions['pathAction']) {
            throw new ErrorException('PathAction of tree options is required.');
        }

        parent::init();
    }

    public function run()
    {
        if ($this->hasModel()) {
            echo Html::activeHiddenInput($this->model, $this->attribute, $this->options);

            $this->treeOptions['inputId'] = Html::getInputId($this->model, $this->attribute);
            $this->treeOptions['defaultActiveId'] = Html::getAttributeValue($this->model, $this->attribute);
        } else {
            $this->options['id'] = "tree-input-{$this->id}";
            echo Html::hiddenInput($this->name, $this->value, $this->options);

            $this->treeOptions['inputId'] = $this->options['id'];
            $this->treeOptions['defaultActiveId'] =  $this->value;
        }

        $this->treeOptions['useEditForm'] = false;
        $this->treeOptions['dnd'] = false;
        $this->treeOptions['canAddRoot'] = false;

        echo $this->render('input', ['id' => $this->id, 'treeOptions' => $this->treeOptions, 'absolute' => $this->absolute]);

        $this->registerAssets();
    }

    public function registerAssets()
    {
        TreeManagerAsset::register($this->getView());

        $this->getView()->registerJs("$('#{$this->id}').fancyTreeManager(" . Json::encode($this->treeOptions) . ")");
    }
}
