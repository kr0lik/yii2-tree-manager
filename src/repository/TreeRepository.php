<?php
namespace kr0lik\tree\repository;

use kr0lik\tree\contracts\TreeModelInterface;
use kr0lik\tree\exception\TreeClassException;
use kr0lik\tree\exception\TreeNotFoundException;

class TreeRepository
{
    /**
     * @var string|TreeModelInterface
     */
    private $modelClass;

    /**
     * @throws TreeClassException
     */
    public function __construct(string $treeModelClass)
    {
        if (!class_exists($treeModelClass)) {
            throw new TreeClassNotExistsException();
        }

        $this->modelClass = $treeModelClass;
    }

    public function getModelClass(): string
    {
        return $this->modelClass;
    }

    /**
     * @param string|int $id
     * @throws TreeNotFoundException
     */
    public function getById($id): TreeModelInterface
    {
        $model = ($this->modelClass)::findTreeModelById($id);

        if (!$model) {
            throw new TreeNotFoundException();
        }

        return $model;
    }

    /**
     * @return TreeModelInterface[]
     */
    public function findRoots(): array
    {
        return ($this->modelClass)::findTreeRoots();
    }

    /**
     * @param int|string|array<int, int|string> $id
     * @return TreeModelInterface[]
     */
    public function findPaths($id): array
    {
        return ($this->modelClass)::findTreePathModelsById($id);
    }
}