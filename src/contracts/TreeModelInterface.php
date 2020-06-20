<?php
namespace kr0lik\tree\contracts;

use kr0lik\tree\exception\TreeValidateException;

interface TreeModelInterface
{
    /**
     * @return int|sttring
     */
    public function getTreeId();

    public function getTreeTitle(): string;

    public function isTreeActive(): bool;

    public function isTreeRoot(): bool;

    public function isTreeFolder(): bool;

    public function getTreeCountAll(): ?int;

    public function getTreeCountActive(): ?int;

    /**
     * @param string|int $id
     */
    public static function findTreeModelById($id): ?TreeModelInterface;

    /**
     * @param int|string|array<int, int|string> $id
     * @return TreeModelInterface[]
     */
    public static function findTreePathModelsById($id): array;

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
}