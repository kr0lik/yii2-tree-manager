<?php
namespace kr0lik\tree;

use yii\base\{Widget, InvalidConfigException};
use yii\web\JsExpression;
use yii\helpers\{Url, Json};

class TreeManagerWidget extends Widget
{
    /**
     * Tree Manager options
     * [
     *      pathAction => // Path to tree-action script. Required
     *      defaultActiveId => null, // Select node on init by default
     *      messages => [
     *          newCategory: 'Новая категория',
     *          youNotChooseCategory: 'Вы не выбрали категорию из списка',
     *          categoryNotChoose: 'Не выбрана категория.',
     *          categoryHasChildren: 'У категории есть вложенные категории.',
     *          deleteCategory: 'Удалить категорию "{categoryName}"?',
     *          cantDeleteCategory: 'Не удалось удлаить категорию.',
     *          cantCreateRootCategory: 'Нельзя создать корневую категорию'
     *      ],
     *      // Drag and Drop
     *      dnd => [
     *          preventVoidMoves: true, // Prevent dropping nodes 'before self', etc.
     *          preventRecursiveMoves: true, // Prevent dropping nodes on own descendants
     *          autoExpandMS: 1000, // Expand nodes after n milliseconds of hovering.
     *      ]
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
     *      firstNodeDefault: true, // Select first node on init, if has not active node
     *      canAddRoot: true, // Allow add root node
     *      canDragToRoot: false, // Make node is root, if dnd enabled
     *      highlightQuantity: true, // Highlight quantity by wrapping inside <small> tags, if name of node like: "some name (quantity)", where quantity is numeric. See TreeManagerAction -> treeQueryScopes
     *      useEditForm: true, // Add quick edit form
     * ]
     *
     * @var array
     */
    public $treeOptions = [];

    public function init()
    {
        if (! isset($this->treeOptions['pathAction']) || ! $this->treeOptions['pathAction']) {
            throw new InvalidConfigException('PathAction of tree options is required.');
        }

        parent::init();
    }

    public function run()
    {
        $this->registerAssets();

        return $this->render('manager', ['id' => $this->id, 'treeOptions' => $this->treeOptions]);
    }

    public function registerAssets()
    {
        TreeManagerAsset::register($this->getView());

        $this->getView()->registerJs("$('#{$this->id}').treeManager(" . Json::encode($this->treeOptions) . ")");
    }
}
