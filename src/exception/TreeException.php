<?php
namespace kr0lik\tree\exception;

class TreeException extends \Exception
{
    public function getName(): string
    {
        return 'Tree error.';
    }
}