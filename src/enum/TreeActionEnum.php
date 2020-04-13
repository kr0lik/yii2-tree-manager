<?php

namespace kr0lik\tree\enum;

class TreeActionEnum
{
    public const GET_ROOTS = 'getRoots';
    public const GET_CHILDRENS = 'getChildrens';
    public const GET_PARENTS = 'getParents';
    public const GET_FORM = 'getForm';
    public const GET_DATA = 'getData';

    public const VALIDATE = 'validate';
    public const CREATE = 'create';
    public const UPDATE = 'update';

    public const MOVE = 'move';
    public const DELETE = 'delete';
}