<?php
namespace kr0lik\tree\exception;

class TreeActionException extends TreeException
{
    public function getName(): string
    {
        return 'Action not supported.';
    }
}