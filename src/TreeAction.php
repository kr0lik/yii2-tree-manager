<?php
namespace kr0lik\tree;

use kr0lik\tree\contracts\TreeModelInterface;
use kr0lik\tree\controllers\TreeController;
use kr0lik\tree\enum\TreeActionEnum;
use kr0lik\tree\exception\TreeActionException;
use kr0lik\tree\exception\TreeException;
use kr0lik\tree\exception\TreeModeException;
use kr0lik\tree\exception\TreeNotFoundException;
use kr0lik\tree\repository\TreeRepository;
use kr0lik\tree\response\TreeResponse;
use Yii;
use yii\base\Action;
use yii\base\InvalidConfigException;
use yii\web\Response;

class TreeAction extends Action
{
    /**
     * @var string
     */
    public $treeModelClass;

    /**
     * @throws InvalidConfigException
     */
    public function init(): void
    {
        $this->validate();

        parent::init();
    }

    /**
     * @throws InvalidConfigException
     * @throws TreeActionException
     * @throws TreeModeException
     * @throws TreeNotFoundException
     *
     * @return array<string, mixed>
     */
    public function run(string $action): array
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        try {
            return $this->runAction($action)->jsonSerialize();
        } catch (TreeException $throwable) {
            return TreeResponse::error($throwable)->jsonSerialize();
        }
    }

    /**
     * @throws InvalidConfigException
     */
    protected function validate(): void
    {
        if (!class_exists($this->treeModelClass)) {
            throw new InvalidConfigException('TreeModelClass not exists.');
        }

        if (!(new $this->treeModelClass) instanceof TreeModelInterface) {
            throw new InvalidConfigException('TreeModelClass must implement ' . TreeModelInterface::class);
        }
    }

    /**
     * @throws TreeActionException
     * @throws TreeModeException
     * @throws TreeNotFoundException
     */
    protected function runAction(string $action): TreeResponse
    {
        switch ($action) {
            case TreeActionEnum::GET_ROOTS:
                return $this->getController()->getRootsAction();
            case TreeActionEnum::GET_CHILDRENS:
                return $this->getController()->getChildrensAction();
            case TreeActionEnum::GET_PARENTS:
                return $this->getController()->getParentsAction();
            case TreeActionEnum::GET_PATHS:
                return $this->getController()->getPathsAction();
            case TreeActionEnum::GET_DATA:
                return $this->getController()->getData();
            default:
                throw new TreeActionException($action);
        }
    }

    protected function getRepository(): TreeRepository
    {
        return new TreeRepository($this->treeModelClass);
    }

    /**
     * @throws TreeModeException
     */
    private function getController(): TreeController
    {
        $repository = $this->getRepository();

        return new TreeController($this->controller, $repository);
    }
}
