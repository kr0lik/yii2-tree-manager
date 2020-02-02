<?php
namespace kr0lik\tree\response;

use kr0lik\tree\exception\{TreeException, TreeModeException};

class TreeResponse implements \JsonSerializable
{
    /**
     * @var bool
     */
    private $success = true;
    /**
     * @var array<string, mixed>
     */
    private $data = [];
    /**
     * @var string
     */
    private $message = '';

    public function setFail(): self
    {
        $this->success = false;

        return $this;
    }

    public function setData(array $data): self
    {
        $this->data = $data;

        return $this;
    }

    public function setMessage(string $message): self
    {
        $this->message = $message;

        return $this;
    }

    /**
     * @param array<string, mixed> $data
     */
    public static function data(array $data): self
    {
        return (new self())
            ->setData($data);
    }

    public static function error(TreeException $exception): self
    {
        return (new self())
            ->setFail()
            ->setMessage("{$exception->getName()} {$exception->getMessage()}")
        ;
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return get_object_vars($this);
    }
}
