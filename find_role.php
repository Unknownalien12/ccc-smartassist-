<?php
$dir = new RecursiveDirectoryIterator('c:\xampp\htdocs\ccc-smartassist');
$iterator = new RecursiveIteratorIterator($dir);
foreach ($iterator as $file) {
    if ($file->isFile() && in_array($file->getExtension(), ['php', 'ts', 'tsx'])) {
        $content = file_get_contents($file->getPathname());
        if (strpos($content, '.role') !== false) {
            echo $file->getPathname() . "\n";
            $lines = explode("\n", $content);
            foreach ($lines as $i => $line) {
                if (strpos($line, '.role') !== false) {
                    echo ($i+1) . ": " . trim($line) . "\n";
                }
            }
        }
    }
}
