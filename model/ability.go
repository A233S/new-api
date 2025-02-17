package model

import (
	"one-api/common"
	"strings"
)

type Ability struct {
	Group     string `json:"group" gorm:"type:varchar(32);primaryKey;autoIncrement:false"`
	Model     string `json:"model" gorm:"primaryKey;autoIncrement:false"`
	ChannelId int    `json:"channel_id" gorm:"primaryKey;autoIncrement:false;index"`
	Enabled   bool   `json:"enabled"`
	// 新增排序字段,默认为0
	Sort int `json:"sort" gorm:"default:0"`
	Priority  *int64 `json:"priority" gorm:"bigint;default:0;index"`
}

func GetGroupModels(group string) []string {
    var models []string
    // Find distinct models
    DB.Table("abilities").Where("`group` = ? and enabled = ?", group, true).Distinct("model").Pluck("model", &models)
    return models
}

func GetRandomSatisfiedChannel(group string, model string) (*Channel, error) {
	ability := Ability{}
	var err error = nil
	if common.UsingSQLite {
		//	根据sort和random排序
		err = DB.Where("`group` = ? and model = ? and enabled = 1", group, model).Order("sort desc, RANDOM()").Limit(1).First(&ability).Error
	} else {
		//	根据sort和random排序
		err = DB.Where("`group` = ? and model = ? and enabled = 1", group, model).Order("sort desc, RAND()").Limit(1).First(&ability).Error
	}
	if err != nil {
		return nil, err
	}
	channel := Channel{}
	channel.Id = ability.ChannelId
	err = DB.First(&channel, "id = ?", ability.ChannelId).Error
	return &channel, err
}



func (channel *Channel) AddAbilities() error {
	models_ := strings.Split(channel.Models, ",")
	groups_ := strings.Split(channel.Group, ",")
	abilities := make([]Ability, 0, len(models_))
	for _, model := range models_ {
		for _, group := range groups_ {
			ability := Ability{
				Group:     group,
				Model:     model,
				ChannelId: channel.Id,
				Enabled:   channel.Status == common.ChannelStatusEnabled,
				Sort:      channel.Sort,
				Priority:  channel.Priority,
			}
			abilities = append(abilities, ability)
		}
	}
	return DB.Create(&abilities).Error
}

func (channel *Channel) DeleteAbilities() error {
	return DB.Where("channel_id = ?", channel.Id).Delete(&Ability{}).Error
}

// UpdateAbilities updates abilities of this channel.
// Make sure the channel is completed before calling this function.
func (channel *Channel) UpdateAbilities() error {
	// A quick and dirty way to update abilities
	// First delete all abilities of this channel
	err := channel.DeleteAbilities()
	if err != nil {
		return err
	}
	// Then add new abilities
	err = channel.AddAbilities()
	if err != nil {
		return err
	}
	return nil
}

func UpdateAbilityStatus(channelId int, status bool) error {
	return DB.Model(&Ability{}).Where("channel_id = ?", channelId).Select("enabled").Update("enabled", status).Error
}
