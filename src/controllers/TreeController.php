<?php
namespace kr0lik\tree\controllers;

use kr0lik\tree\contracts\TreeModelInterface;
use kr0lik\tree\exception\TreeNotFoundException;
use kr0lik\tree\response\TreeResponse;
use Yii;

class TreeController extends AbstractTreeController
{
    public function getRootsAction(): TreeResponse
    {
        $models = $this->repository->findRoots();

        return TreeResponse::data(array_map(function (TreeModelInterface $model) {
            return $this->prepareModelData($model);
        }, $models));
    }

    /**
     * @throws TreeNotFoundException
     */
    public function getChildrensAction(): TreeResponse
    {
        $targetId = Yii::$app->request->get('targetId');

        $model = $this->repository->getById($targetId);
        $models = $model->getChildrenTreeModels();

        return TreeResponse::data(array_map(function (TreeModelInterface $model) {
            return $this->prepareModelData($model);
        }, $models));
    }

    /**
     * @throws TreeNotFoundException
     */
    public function getParentsAction(): TreeResponse
    {
        $targetId = Yii::$app->request->get('targetId');

        $model = $this->repository->getById($targetId);
        $models = $model->getParentTreeModels();

        return TreeResponse::data(array_map(function (TreeModelInterface $model) {
            return $this->prepareModelData($model);
        }, $models));
    }

    /**
     * @throws TreeNotFoundException
     */
    public function getData(): TreeResponse
    {
        $targetId = Yii::$app->request->get('targetId');

        $model = $this->repository->getById($targetId);

        return TreeResponse::data($this->prepareModelData($model));
    }
}
