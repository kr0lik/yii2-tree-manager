<?php
namespace kr0lik\tree\controllers;

use kr0lik\tree\contracts\TreeModelInterface;
use kr0lik\tree\enum\TreeModeEnum;
use kr0lik\tree\exception\TreeModeException;
use kr0lik\tree\repository\TreeRepository;
use Yii;
use yii\web\Controller;

class AbstractTreeController
{
    /**
     * @var Controller
     */
    protected $controller;
    /**
     * @var TreeRepository
     */
    protected $repository;

    /**
     * @throws TreeModeException
     */
    public function __construct(Controller $controller, TreeRepository $repository)
    {
        $this->validateMode();

        $this->controller = $controller;
        $this->repository = $repository;
    }

    /**
     * @throws TreeModeException
     */
    private function validateMode(): void
    {
        $mode = Yii::$app->request->get('mode');

        $enumModeClass = new \ReflectionClass(TreeModeEnum::class);

        if  ($mode && !in_array($mode, $enumModeClass->getConstants())) {
            throw new TreeModeException($mode);
        }
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
            'has-children' => $model->hasChildrenTreeModels(),
            'children' => $model->hasChildrenTreeModels() ? null : [],
            'data' => [
                'id' => $model->getTreeId(),
                'countAll' => $model->getTreeCountAll(),
                'countActive' => $model->getTreeCountActive(),
            ],
        ];
    }
}