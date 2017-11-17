<?php
namespace kr0lik\tree;

use Yii;
use yii\base\Action;
use yii\web\Response;

class TreeManagerAction extends Action
{
    /**
     * Class of tree category model
     *
     * @var string
     */
    public $categoryClass;

    /**
     * Path to view of additional fields for quick form edit
     *
     * @var string
     */
    public $quickFormFieldsView;

    /**
     * Path to view of additional buttons for quick form edit
     *
     * @var string
     */
    public $quickFormButtonsView;


    /**
     * Scopes for tree query
     *
     * @var array
     */
    public $treeQueryScopes = [];


    /**
     * Return array for json format
     *
     * @param string $action
     * @param int/null $targetId
     * @param int/null $hitId
     * @param string/null $mode
     * @return array
     */
    public function run(string $action, $targetId = null, $hitId = null, $mode = null): array
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        switch ($action) {
            case 'tree':
                $data = $this->tree($targetId);
                break;
            case 'move':
                $data = $this->move($mode, $targetId, $hitId);
                break;
            case 'load':
                $mode = $mode ?: 'after';
                $data = $this->load($targetId, $hitId, $mode);
                break;
            case 'delete':
                $data = $this->delete($targetId);
                break;
            default:
                $data['success'] = false;
                $data['message'] = 'No action';
        }

        return $data;
    }

    private function tree($activeId = null): array
    {
        return ($this->categoryClass)::getTree([
            'id',
            'title' => 'name',
            'folder' => function () { return false; },
            'icon' => function ($category) { return $category->isRoot() ? 'fa fa-tree' : false; },
            'active' => function ($category) use ($activeId) { return $activeId ? $activeId == $category->id : $category->isRoot(); },
            'expanded' => function ($category) use ($activeId) { return $category->isRoot(); }
        ], $this->treeQueryScopes);
    }

    private function load($targetId = null, $hitId = null, $mode = 'after'): array
    {
        $targetCategory = ($this->categoryClass)::findOne((int) $targetId) ?? new $this->categoryClass;

        $success = true;
        if ($targetCategory->load(Yii::$app->request->post())) {
            if ($hitId) {
                $hitCategory = ($this->categoryClass)::findOne($hitId);
                $success = $hitCategory->$mode($targetCategory);
            } else {
                $success = $targetCategory->save();
            }
        }

        return [
            'success' => $success,
            'id' => $targetCategory->id,
            'hitId' => $hitId,
            'html' => $this->controller->renderFile(__DIR__ . '/views/edit.php', [
                'category' => $targetCategory,
                'hitId' => $hitId,
                'fields' => $this->quickFormFieldsView,
                'buttons' => $this->quickFormButtonsView
            ])
        ];
    }

    private function move(string $mode, $targetId, $hitId): array
    {
        if ($targetId && $hitId) {
            $targetCategory = ($this->categoryClass)::findOne($targetId);
            $hitCategory = ($this->categoryClass)::findOne($hitId);

            $mode = $mode == 'over' ? 'append' : $mode;
            $success = $hitCategory->$mode($targetCategory);

            if (! $success) {
                $message = implode(' ', $hitCategory->getFirstErrors());
            }

            $message = '';
        } else {
            $success = false;
            $message = 'No id specified.';
        }

        return ['success' => $success, 'id' => $targetId, 'message' => $message];
    }

    private function delete(int $id): array
    {
        $category = ($this->categoryClass)::findOne($id);

        $success = false;
        $message = '';
        if ($category) {
            if (! ($success = $category->delete())) {
                $message = implode(' ', $category->getFirstErrors());
            }
        }

        return ['success' => $success, 'message' => $message];
    }
}
