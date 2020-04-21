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
     * @var string|TreeModelInterface
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
     * @param string|int $id
     * @throws TreeNotFoundException
     */
    public function getById($id): TreeModelInterface
    {
        /** @var TreeModelInterface|null $model */
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