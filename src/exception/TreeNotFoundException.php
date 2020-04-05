<?php
namespace kr0lik\tree\exception;

class TreeNotFoundException extends TreeException
{
    public function getName(): string 
    {
        return 'Model not found.';
    }
}