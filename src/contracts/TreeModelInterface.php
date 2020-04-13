<?php
namespace kr0lik\tree\contracts;

use kr0lik\tree\exception\TreeValidateException;

interface TreeModelInterface
{
    public function getTreeId(): int;

    public function getTreeTitle(): string;

    public function isTreeActive(): bool;

    public function isTreeRoot(): bool;

    public function isTreeFolder(): bool;

    public function getTreeCountAll(): ?int;

    public function getTreeCountActive(): ?int;

    public static function findTreeModelById(int $id): ?TreeModelInterface;

    /**
     * @return TreeModelInterface[]
     */
    public static function findTreeRoots(): array;

    public function hasChildrenTreeModels(): bool;

    /**
     * @return TreeModelInterface[]
     */
    public function getChildrenTreeModels(): array;

    /**
     * @return TreeModelInterface[]
     */
    public function getParentTreeModels(): array;

    /**
     * @throws TreeValidateException
     */
    public function addTreeRoot(): void;

    /**
     * @throws TreeValidateException
     */
    public function appendToTreeModel(TreeModelInterface $model): void;

    /**
     * @throws TreeValidateException
     */
    public function moveAfterTreeModel(TreeModelInterface $model): void;

    /**
     * @throws TreeValidateException
     */
    public function moveBeforeTreeModel(TreeModelInterface $model): void;

    public function deleteTreeModel(): void;
}