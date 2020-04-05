<?php
namespace kr0lik\tree\contracts;

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

    public function addTreeRoot(): void;

    public function appendToTreeModel(TreeModelInterface $model): void;

    public function moveAfterTreeModel(TreeModelInterface $model): void;

    public function moveBeforeTreeModel(TreeModelInterface $model): void;

    public function deleteTreeModel(): void;
}