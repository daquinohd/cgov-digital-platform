<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\cgov_core\Services\CgovNavigationManager;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;

/**
 * Provides a 'Public Use' text block.
 *
 * @Block(
 *  id = "cgov_public_use",
 *  admin_label = @Translation("Cgov Public Use"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class PublicUse extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Cgov Navigation Manager Service.
   *
   * @var \Drupal\cgov_core\Services\CgovNavigationManager
   */
  protected $navMgr;

  /**
   * Constructs an LanguageBar object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\cgov_core\Services\CgovNavigationManager $navigationManager
   *   Cgov navigation service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    CgovNavigationManager $navigationManager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->navMgr = $navigationManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_core.cgov_navigation_manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    $shouldDisplay = $this->navMgr->getCurrentPathIsInNavigationTree();
    if ($shouldDisplay) {
      return AccessResult::allowed();
    }
    return AccessResult::forbidden();
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#plain_text' => 'public_use,block_content',
      '#theme' => 'cgov_common',
      '#type' => 'block',
    ];
    return $build;
  }

}
