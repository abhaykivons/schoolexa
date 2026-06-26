<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Crypt;

class SecureGenerateKey extends Command
{
    protected $signature = 'app:secure-generate-key';
    protected $description = 'Generate an encrypted key and store it in a hidden path';

    public function handle()
    {
        $masterKey = base64_decode((string) config('app.encryption_master_key'));
        if (!$masterKey) {
            $this->error('Master key missing!');
            return;
        }

        $appKey = base64_encode(random_bytes(32));
        $iv = random_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $cipherText = openssl_encrypt($appKey, 'aes-256-cbc', $masterKey, 0, $iv);
        $final = base64_encode($iv . '::' . $cipherText);

        Storage::disk('local')->put('framework/cache/.sys_bin_', $final);

        $this->info('Encrypted application key stored securely.');
    }
}

