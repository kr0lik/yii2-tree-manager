<?php
namespace kr0lik\tree\controllers;

use kr0lik\tree\contracts\TreeModelInterface;
use kr0lik\tree\enum\TreeManagerActionEnum;
use kr0lik\tree\enum\TreeManagerModeEnum;
use kr0lik\tree\exception\{TreeManagerModeException, TreeNotFoundException, TreeValidateException};
use kr0lik\tree\repository\TreeRepository;
use kr0lik\tree\response\TreeResponse;
use Yii;
use yii\base\Model;
use yii\db\ActiveRecord;
use yii\helpers\Url;
use yii\web\Controller;

class TreeManagerController extends TreeController
{
    /**
     * @throws TreeManagerModeException
     */
    public function __construct(Controller $controller, TreeRepository $repository)
    {
        parent::__construct($controller, $repository);

        $this->validateMode();
    }

    /**
     * @throws TreeManagerModeException
     */
    private function validateMode(): void
    {
        $mode = Yii::$app->request->get('mode');

        $enumModeClass = new \ReflectionClass(TreeManagerModeEnum::class);

        if  ($mode && !in_array($mode, $enumModeClass->getConstants())) {
            throw new TreeManagerModeException($mode);
        }
    }

    /**
     * @param string[]|callable $formFields
     * @param string[]|callable $formLinks
     * @param array<string, string> $bsCssClasses
     *
     * @throws TreeNotFoundException
     */
    public function getFormAction(string $formViewPath, string $formNameField, array $formFields, array $formLinks, array $bsCssClasses): TreeResponse
    {
        $targetId = Yii::$app->request->get('targetId');

        if ($targetId) {
            $targetModel = $this->repository->getById($targetId);
        } else {
            $class = $this->repository->getModelClass();
            /** @var TreeModelInterface $targetModel */
            $targetModel = new $class;
        }

        return TreeResponse::data([
            'form' => $this->controller->renderAjax($formViewPath, [
                'model' => $targetModel,
                'nameField' => $formNameField,
                'actionUrl' => $this->getFormActionUrl(),
                'fields' => $formFields,
                'links' => $formLinks,
                'bsCssClasses' => $bsCssClasses,
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
            $query['action'] = TreeManagerActionEnum::UPDATE;
        } else {
            $query['action'] = TreeManagerActionEnum::CREATE;
        }

        return Url::to($query);
    }

    public function validateAction(): TreeResponse
    {
        $postData = Yii::$app->request->post();

        $class = $this->repository->getModelClass();
        /** @var ActiveRecord|TreeModelInterface $targetModel */
        $targetModel = new $class;
        $targetModel->load($postData);

        $attributes = array_key_exists($targetModel->formName(), $postData) ? array_keys($postData[$targetModel->formName()]) : null;

        if (!$targetModel->validate($attributes)) {
            throw new TreeValidateException($targetModel);
        }

        return TreeResponse::data([]);
    }

    /**
     * @throws TreeNotFoundException
     */
    public function createAction(): TreeResponse
    {
        $hitId = Yii::$app->request->get('hitId');
        $mode = Yii::$app->request->get('mode');

        if (!in_array($mode, [TreeManagerModeEnum::AFTER, TreeManagerModeEnum::CHILD])) {
            throw new TreeModeException($mode);
        }

        $class = $this->repository->getModelClass();
        /** @var TreeModelInterface|Model $targetModel */
        $targetModel = new $class;
        $targetModel->load(Yii::$app->request->post());

        if ($hitId) {
            $hitModel = $this->repository->getById($hitId);
            if ($mode === TreeManagerModeEnum::CHILD) {
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
        $targetModel = $this->repository->getById($targetId);
        $targetModel->load(Yii::$app->request->post());

        if (!$targetModel->save()) {
            throw new TreeValidateException($targetModel);
        }

        return TreeResponse::data($this->prepareModelData($targetModel));
    }

    /**
     * @throws TreeNotFoundException
     */
    public function deleteAction(): TreeResponse
    {
        $targetId = Yii::$app->request->get('targetId');

        $targetModel = $this->repository->getById($targetId);

        $targetModel->deleteTreeModel();

        return new TreeResponse();
    }

    /**
     * @throws TreeNotFoundException
     * @throws TreeManagerModeException
     */
    public function moveAction(): TreeResponse
    {
        $targetId = Yii::$app->request->get('targetId');
        $hitId = Yii::$app->request->get('hitId');
        $mode = Yii::$app->request->get('mode');

        $targetModel = $this->repository->getById($targetId);
        $hitModel = $this->repository->getById($hitId);

        switch ($mode) {
            case TreeManagerModeEnum::OVER:
            case TreeManagerModeEnum::CHILD:
                $targetModel->appendToTreeModel($hitModel);
                break;
            case TreeManagerModeEnum::AFTER:
                $targetModel->moveAfterTreeModel($hitModel);
                break;
            case TreeManagerModeEnum::BEFORE:
                $targetModel->moveBeforeTreeModel($hitModel);
                break;
            default:
                throw new TreeManagerModeException();
        }

        return TreeResponse::data($this->prepareModelData($targetModel));
    }
}
