<?php
namespace kr0lik\tree\exception;

class TreeClassException extends TreeException
{
    public function getName(): string 
    {
        return 'Class not exist.';
    }
}