<?php
namespace kr0lik\tree\controllers;

use kr0lik\tree\contracts\TreeModelInterface;
use kr0lik\tree\enum\TreeActionEnum;
use kr0lik\tree\enum\TreeModeEnum;
use kr0lik\tree\exception\{TreeModeException, TreeNotFoundException};
use kr0lik\tree\response\TreeResponse;
use Yii;
use yii\base\ErrorException;
use yii\db\ActiveRecord;
use yii\helpers\Url;

class TreeManagerController extends AbstractTreeController
{
    /**
     * @param string[]|callable $formFields
     * @param string[]|callable $formLinks
     *
     * @throws TreeNotFoundException
     */
    public function getFormAction(string $formViewPath, string $formTitleField, array $formFields, array $formLinks): TreeResponse
    {
        $targetId = Yii::$app->request->get('targetId');

        if ($targetId) {
            $targetModel = $this->repository->getById((int) $targetId);
        } else {
            $class = $this->repository->getTreeModelClass();
            /** @var TreeModelInterface $targetModel */
            $targetModel = new $class;
        }

        return TreeResponse::data([
            'html' => $this->controller->renderFile($formViewPath, [
                'model' => $targetModel,
                'titleField' => $formTitleField,
                'actionUrl' => $this->getFormActionUrl(),
                'fields' => $formFields,
                'links' => $formLinks,
            ]),
        ]);
    }

    private function getFormActionUrl(): string
    {
        $targetId = Yii::$app->request->get('targetId');
        $hitId = Yii::$app->request->get('hitId');
        $mode = Yii::$app->request->get('mode');

        $query = [
            '',
            'targetId' => $targetId,
            'hitId' => $hitId,
            'mode' => $mode
        ];

        if ($targetId) {
            $query['action'] = TreeActionEnum::UPDATE;
        } else {
            $query['action'] = TreeActionEnum::CREATE;
        }

        return Url::to($query);
    }

    /**
     * @throws TreeNotFoundException
     */
    public function createAction(): TreeResponse
    {
        $hitId = Yii::$app->request->get('hitId');
        $mode = Yii::$app->request->get('mode');

        if (!in_array($mode, [TreeModeEnum::AFTER, TreeModeEnum::CHILD])) {
            throw new TreeModeException($mode);
        }

        $class = $this->repository->getTreeModelClass();
        /** @var TreeModelInterface $targetModel */
        $targetModel = new $class;
        $targetModel->load(Yii::$app->request->post());

        if ($hitId) {
            $hitModel = $this->repository->getById((int) $hitId);
            if ($mode === TreeModeEnum::CHILD) {
                $targetModel->appendToTreeModel($hitModel);
            } else {
                $targetModel->moveAfterTreeModel($hitModel);
            }
        } else {
            $targetModel->addTreeRoot();
        }

        return TreeResponse::data($this->prepareModelData($targetModel));
    }

    /**
     * @throws TreeNotFoundException
     */
    public function updateAction(): TreeResponse
    {
        $targetId = Yii::$app->request->get('targetId');

        /** @var ActiveRecord|TreeModelInterface $targetModel */
        $targetModel = $this->repository->getById((int) $targetId);
        $targetModel->load(Yii::$app->request->post());

        if (!$targetModel->save()) {
            throw new ErrorException('Save error');
        }

        return TreeResponse::data($this->prepareModelData($targetModel));
    }

    /**
     * @throws TreeNotFoundException
     */
    public function deleteAction(): TreeResponse
    {
        $targetId = Yii::$app->request->get('targetId');

        /** @var TreeModelInterface $targetModel */
        $targetModel = $this->repository->getById((int) $targetId);

        $targetModel->deleteTreeModel();

        return new TreeResponse();
    }

    /**
     * @throws TreeNotFoundException
     */
    public function moveAction(): TreeResponse
    {
        $targetId = Yii::$app->request->get('targetId');
        $hitId = Yii::$app->request->get('hitId');
        $mode = Yii::$app->request->get('mode');

        $targetModel = $this->repository->getById((int) $targetId);
        $hitModel = $this->repository->getById((int) $hitId);

        switch ($mode) {
            case TreeModeEnum::OVER:
            case TreeModeEnum::CHILD:
                $targetModel->appendToTreeModel($hitModel);
                break;
            case TreeModeEnum::AFTER:
                $targetModel->moveAfterTreeModel($hitModel);
                break;
            case TreeModeEnum::BEFORE:
                $targetModel->moveBeforeTreeModel($hitModel);
                break;
            default:
                throw new TreeModeException();
        }

        return TreeResponse::data($this->prepareModelData($targetModel));
    }
}
