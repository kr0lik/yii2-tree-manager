<?php
namespace kr0lik\tree\repository;

use kr0lik\tree\contracts\TreeModelInterface;
use kr0lik\tree\exception\TreeClassException;
use kr0lik\tree\exception\TreeNotFoundException;

/**
 * Class TreeRepository.
 */
class TreeRepository
{
    /**
     * @var string
     */
    private $treeModelClass;

    public function __construct(string $treeModelClass)
    {
        if (!class_exists($treeModelClass)) {
            throw new TreeClassException();
        }

        $this->treeModelClass = $treeModelClass;
    }

    public function getTreeModelClass(): string
    {
        return $this->treeModelClass;
    }

    /**
     * @throws TreeNotFoundException
     */
    public function getById(int $id): TreeModelInterface
    {
        /** @var TreeModelInterface|null$model */
        $model = ($this->treeModelClass)::findTreeModelById($id);

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
        return ($this->treeModelClass)::findTreeRoots();
    }
}