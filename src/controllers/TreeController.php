<?php
namespace kr0lik\tree\controllers;

use kr0lik\tree\contracts\TreeModelInterface;
use kr0lik\tree\exception\TreeNotFoundException;
use kr0lik\tree\repository\TreeRepository;
use kr0lik\tree\response\TreeResponse;
use Yii;
use yii\web\Controller;

class TreeController
{
    /**
     * @var Controller
     */
    protected $controller;
    /**
     * @var TreeRepository
     */
    protected $repository;

    public function __construct(Controller $controller, TreeRepository $repository)
    {
        $this->controller = $controller;
        $this->repository = $repository;
    }

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
    public function getPathsAction(): TreeResponse
    {
        $targetId = Yii::$app->request->get('targetId');

        /** @var TreeModelInterface $class */
        $models = $this->repository->findPaths($targetId);

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

    /**
     * @return array<string, mixed>
     */
    protected function prepareModelData(TreeModelInterface $model): array
    {
        return [
            'title' => $model->getTreeTitle(),
            'folder' => $model->isTreeFolder(),
            'expanded' => false,
            'lazy' => true,
            'children' => $model->hasChildrenTreeModels() ? null : [],
            'data' => [
                'id' => $model->getTreeId(),
                'countAll' => $model->getTreeCountAll(),
                'countActive' => $model->getTreeCountActive(),
                'hasChildren' => $model->hasChildrenTreeModels(),
            ],
        ];
    }
}
