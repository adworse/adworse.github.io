#!/usr/bin/env bash

echo 'gem: --no-rdoc --no-ri' >> ~/.gemrc
echo 'Installing Ruby libraries manager'
gem install bundler

echo 'Getting script source'
wget adworse.github.io/installers/medium.tar.gz

tar -xvzf medium.tar.gz && rm medium.tar.gz

echo 'Installing Ruby gems for script to run'
bundle

chmod +x scraper.rb

echo 'Now you can start scraping like this:'

echo './scraper.rb username_1 username_2 username_n'
echo 'or even like this:'

echo 'cat list.txt | xargs ./scraper.rb'
