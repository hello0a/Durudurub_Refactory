package com.aloha.durudurub.dto;

import java.util.List;

import lombok.Data;

@Data
public class HostClubresponse {
    private Club club;
    private List<ClubMember> pendingMembers;
    private List<ClubMember> approvedMembers;
}
