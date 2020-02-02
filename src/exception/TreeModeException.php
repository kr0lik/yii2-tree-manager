<?php
namespace kr0lik\tree\exception;

class TreeModeException extends TreeException
{
    public function getName(): string 
    {
        return 'Mode not supported.';
    }
}